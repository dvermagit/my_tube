import { db } from "@/db";
import { videos } from "@/db/schema";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { eq, and, or, lt, desc } from "drizzle-orm";
import { z } from "zod";

export const studioRouter = createTRPCRouter({
  getMany: protectedProcedure
    .input(
      z.object({
        cursor: z
          .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
          })
          .nullish(), // Make cursor optional
        limit: z.number().default(10), // Add limit with a default value
      })
    )
    .query(async ({ ctx, input }) => {
      const { cursor, limit } = input; // Destructure limit from input
      const { id: userId } = ctx.user;

      // Fetch data from the database
      const data = await db
        .select()
        .from(videos)
        .where(
          and(
            eq(videos.userId, userId), // Filter by userId
            cursor
              ? or(
                  lt(videos.updatedAt, cursor.updatedAt),
                  and(
                    eq(videos.updatedAt, cursor.updatedAt),
                    lt(videos.id, cursor.id)
                  )
                )
              : undefined
          )
        )
        .orderBy(desc(videos.updatedAt), desc(videos.id)) // Order by updatedAt and id
        .limit(limit + 1); // Fetch one extra item to check if there's more data

      // Determine if there are more items to fetch
      const hasMore = data.length > limit;
      const items = hasMore ? data.slice(0, -1) : data; // Remove the extra item if it exists

      // Calculate the next cursor
      const lastItem = items[items.length - 1];
      const nextCursor = hasMore
        ? {
            id: lastItem.id,
            updatedAt: lastItem.updatedAt,
          }
        : null;

      return { items, nextCursor };
    }),
});

// import { db } from "@/db";
// import { videos } from "@/db/schema";
// import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
// import { eq, and, or, lt, desc } from "drizzle-orm";
// import { z } from "zod";

// export const studioRouter = createTRPCRouter({
//   getMany: protectedProcedure
//     .input(
//       z.object({
//         cursor: z
//           .object({
//             id: z.string().uuid(),
//             updatedAt: z.date(),
//           })
//           .nullish(),
//         limit: z.number().default(10),
//       })
//     )
//     .query(async ({ ctx, input }) => {
//       const { cursor, limit } = input;
//       const { id: userId } = ctx.user;
//       const data = await db
//         .select()
//         .from(videos)
//         .where(
//           and(
//             eq(videos.userId, userId),
//             cursor
//               ? or(
//                   lt(videos.updatedAt, cursor.updatedAt),
//                   and(
//                     eq(videos.updatedAt, cursor.updatedAt),
//                     lt(videos.id, cursor.id)
//                   )
//                 )
//               : undefined
//           )
//         )
//         .orderBy(desc(videos.updatedAt), desc(videos.id))
//         .limit(limit + 1);

//       const hasMore = data.length > limit;
//       const items = hasMore ? data.slice(0, -1) : data;
//       const lastItem = items[items.length - 1];
//       const nextCursor = hasMore
//         ? {
//             id: lastItem.id,
//             updatedAt: lastItem.updatedAt,
//           }
//         : null;
//       return { items, nextCursor };
//     }),
// });
