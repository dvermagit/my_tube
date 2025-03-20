import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { HfInference } from "@huggingface/inference";

interface InputType {
  userId: string;
  videoId: string;
}

const DESCRIPTION_SYSTEM_PROMPT = `Your task is to summarize the transcript of a video. Please follow these guidelines:
- Be brief.into a summary that captures the key points and main ideas without losing important details.
- Avoid jargon or overly complex language unless necessary for the context.
- Focus on the most critical information, ignoring filler, repetitive statements, or irrelevant tangents.
- ONLY return the summary, no other text, annotations, or comments.
- Aim for a summary that is 3-5 sentences long and no more than 200 characters.;`;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

  const video = await context.run("get-video", async () => {
    const [existingVideo] = await db
      .select()
      .from(videos)
      .where(and(eq(videos.userId, userId), eq(videos.id, videoId)));

    if (!existingVideo) {
      throw new Error("NOT_FOUND");
    }

    return existingVideo;
  });

  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch transcript");
    }
    return await response.text();
  });

  const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);

  const inputText = `${DESCRIPTION_SYSTEM_PROMPT}\n\nTranscript:\n${transcript}`;

  const response = await hf.textGeneration({
    model: "gpt2",
    inputs: inputText,
    parameters: {
      max_new_tokens: 50,
    },
  });

  const description = response.generated_text.trim();

  if (!description) {
    throw new Error("Failed to generate title");
  }

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ description: description || video.description })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });

  await context.run("second-step", () => {
    console.log("second step ran");
  });

  return new Response(JSON.stringify({ success: true, description }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
