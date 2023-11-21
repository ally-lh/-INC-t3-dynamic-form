// import { postRouter } from "@/server/api/routers/post";
import { createTRPCRouter } from "@/server/api/trpc";
import { formRouter } from "./routers/form";
import { questionRouter } from "./routers/question";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  form: formRouter,
  question: questionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
