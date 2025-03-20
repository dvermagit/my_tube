import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { HfInference } from "@huggingface/inference";

interface InputType {
  userId: string;
  videoId: string;
}

const TITLE_SYSTEM_PROMPT = `Your task is to generate an SEO-focused title for a YouTube video
based on its transcript. Please follow these guidelines:
- Be concise but descriptive, using relevant keywords to improve discoverability.
- Highlight the most compelling or unique aspect of the video content.
- Avoid jargon or overly complex language unless it directly supports searchability.
- Use action-oriented phrasing or clear value propositions where applicable.
- Ensure the title is 3-8 words long and no more than 100 characters.
- ONLY return the title as plain text. Do not add quotes or any additional formatting.`;

export const { POST } = serve(async (context) => {
  const input = context.requestPayload as InputType;
  const { userId, videoId } = input;

  // Fetch the video from the database
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

  // Fetch the transcript
  const transcript = await context.run("get-transcript", async () => {
    const trackUrl = `https://stream.mux.com/${video.muxPlaybackId}/text/${video.muxTrackId}.txt`;
    const response = await fetch(trackUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch transcript");
    }
    return await response.text();
  });

  // Initialize Hugging Face Inference
  const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN); // Ensure the API key is passed correctly

  // Prepare the input for the model
  const inputText = `${TITLE_SYSTEM_PROMPT}\n\nTranscript:\n${transcript}`;

  // Generate a title using Hugging Face
  const response = await hf.textGeneration({
    model: "gpt2", // Use a public model like GPT-2
    inputs: inputText, // Pass the prepared input
    parameters: {
      max_new_tokens: 50, // Limit the response length
    },
  });

  const title = response.generated_text.trim();

  if (!title) {
    throw new Error("Failed to generate title");
  }

  // Update the video title in the database
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ title: title || video.title }) // Fallback to the existing title if generation fails
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });

  // Run a second step (example)
  await context.run("second-step", () => {
    console.log("second step ran");
  });

  return new Response(JSON.stringify({ success: true, title }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
