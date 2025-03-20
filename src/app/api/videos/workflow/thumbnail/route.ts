import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";
import { HfInference } from "@huggingface/inference";
import { UTApi } from "uploadthing/server";
import sharp from "sharp";

interface InputType {
  userId: string;
  videoId: string;
  prompt: string;
}

export const { POST } = serve(async (context) => {
  const utapi = new UTApi();

  const input = context.requestPayload as InputType;
  const { userId, videoId, prompt } = input;

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

  // Initialize Hugging Face Inference
  const hf = new HfInference(process.env.HUGGING_FACE_ACCESS_TOKEN);

  // Generate an image using Hugging Face
  const imageBlob = await hf.textToImage({
    model: "stabilityai/stable-diffusion-2-1", // Use Stable Diffusion model
    inputs: prompt,
    parameters: {
      height: 512,
      width: 512,
      num_inference_steps: 50,
    },
  });

  // Convert the image blob to a buffer
  const imageBuffer = await imageBlob.arrayBuffer();

  // Validate the image using sharp
  try {
    await sharp(imageBuffer).metadata();
  } catch (error) {
    console.error("Invalid image data:", error);
    throw new Error("Invalid image data");
  }

  // Convert the image buffer to a base64 string
  const imageBase64 = Buffer.from(imageBuffer).toString("base64");

  if (!imageBase64) {
    throw new Error("Failed to generate image");
  }

  // Clean up the old thumbnail
  await context.run("cleanup-thumbnail", async () => {
    if (video.thumbnailKey) {
      await utapi.deleteFiles(video.thumbnailKey);
      await db
        .update(videos)
        .set({ thumbnailKey: null, thumbnailUrl: null })
        .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
    }
  });

  // Upload the new thumbnail
  const uploadThumbnail = await context.run("upload-thumbnail", async () => {
    try {
      // Try uploading via base64 URL
      const uploadResponse = await utapi.uploadFilesFromUrl(
        `data:image/png;base64,${imageBase64}`
      );

      console.log("UploadThing Response (URL):", uploadResponse);

      if (!uploadResponse.data) {
        throw new Error("Failed to upload thumbnail via URL");
      }
      return uploadResponse.data;
    } catch (urlError) {
      console.error("Error uploading via URL:", urlError);

      // Fallback to file upload
      const file = new File([imageBuffer], "thumbnail.png", {
        type: "image/png",
      });
      const uploadResponse = await utapi.uploadFiles(file);

      console.log("UploadThing Response (File):", uploadResponse);

      if (!uploadResponse.data) {
        throw new Error("Failed to upload thumbnail via file");
      }
      return uploadResponse.data;
    }
  });

  // Update the video with the new thumbnail
  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({
        thumbnailKey: uploadThumbnail.key,
        thumbnailUrl: uploadThumbnail.url,
      })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });

  // Run a second step (example)
  await context.run("second-step", () => {
    console.log("second step ran");
  });

  return new Response(JSON.stringify({ success: true, image: imageBase64 }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
