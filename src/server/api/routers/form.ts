import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const formRouter = createTRPCRouter({
  getAllFormSmallDisplay: protectedProcedure.query(async ({ ctx }) => {
    // Use Prisma client to fetch all forms
    // Include related models like questions (and answers if needed)
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.session.user.id,
      },
    });

    if (!user) throw new Error("User not found");
    const forms = await ctx.db.form.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        updatedAt: true,
      },
      where: {
        userId: user?.id,
      },
    });

    return forms;
  }),

  getFormById: protectedProcedure
    .input(z.object({ id: z.string() })) // Validate the input using Zod
    .query(async ({ ctx, input }) => {
      // Fetch the form by ID
      const form = await ctx.db.form.findUnique({
        where: { id: input.id },
        include: {
          questions: {
            include: {
              answer: true,
              options: true,
            },
          },
        },
      });

      // Handle case where form is not found
      if (!form) {
        throw new Error("Form not found");
      }

      return form; // Return the form with its questions, answers, and options
    }),
  createForm: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { title, description } = input;

      // Create a new form
      const newForm = await ctx.db.form.create({
        data: {
          title: title,
          description: description,
          userId: ctx.session.user.id,
        },
      });
      const defaultQuestion = await ctx.db.question.create({
        data: {
          questionText: "Untitled Question",
          questionType: "text",
          isRequired: false,
          formId: newForm.id,
        },
      });

      return newForm.id;
    }),

  updateForm: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, title, description } = input;

      // Fetch the form by ID
      const form = await ctx.db.form.findUnique({
        where: { id: id },
      });

      // Handle case where form is not found
      if (!form) {
        throw new Error("Form not found");
      }

      // Update the form
      const updatedForm = await ctx.db.form.update({
        where: { id: id },
        data: {
          title: title,
          description: description,
        },
      });

      return updatedForm;
    }),
});
