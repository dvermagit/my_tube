import { db } from "@/db";
import { videos } from "@/db/schema";
import { serve } from "@upstash/workflow/nextjs";
import { and, eq } from "drizzle-orm";

interface InputType {
  userId: string;
  videoId: string;
}
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

  // Use Api here

  await context.run("update-video", async () => {
    await db
      .update(videos)
      .set({ description: "Updated from background job" })
      .where(and(eq(videos.id, video.id), eq(videos.userId, video.userId)));
  });

  await context.run("second-step", () => {
    console.log("second step ran");
  });
});
