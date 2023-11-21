import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";

export const questionRouter = createTRPCRouter({
  updateQuestion: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        questionText: z.string().optional(),
        isRequired: z.boolean().optional(),
        options: z.array(z.string()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { questionId, questionText, isRequired, options } = input;
      const question = await ctx.db.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      const updatedQuestion = await ctx.db.question.update({
        where: { id: questionId },
        data: {
          questionText: questionText ? questionText : question.questionText,

          isRequired: isRequired ? isRequired : question.isRequired,
        },
      });

      return updatedQuestion;
    }),
  updateQuestionAnswer: protectedProcedure
    .input(
      z.object({
        questionId: z.string(),
        answerValue: z
          .union([z.string(), z.array(z.string()), z.null()])
          .optional(), // Answer value is optional
        selectedOptionIds: z
          .array(
            z.object({
              id: z.string(),
              questionId: z.string(),
              optionText: z.string(),
              isSelected: z.boolean(),
            }),
          )
          .optional(), // Optional: IDs of selected options
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { questionId, answerValue, selectedOptionIds } = input;

      // Fetch the question to determine its type
      const question = await ctx.db.question.findUnique({
        where: { id: questionId },
      });

      if (!question) {
        throw new Error("Question not found");
      }

      // Check the question type and update accordingly
      if (["option", "checkbox"].includes(question.questionType)) {
        // Update options for 'options' or 'checkbox' question types

        if (selectedOptionIds) {
          // Reset selection for all options of this question
          await ctx.db.option.updateMany({
            where: { questionId: questionId },
            data: { isSelected: false },
          });

          const optionIds = selectedOptionIds.map((opt) => opt.id);
          // Update isSelected to true for selected options
          await ctx.db.option.updateMany({
            where: {
              questionId: questionId,
              id: { in: optionIds }, // Use just the IDs here
            },
            data: { isSelected: true },
          });
        }
      } else {
        // Update answer for other question types
        const answerData = {
          questionId: questionId,
          answer: answerValue ? answerValue : null, // Ensure this is a string or null
        };

        // Check for existing answer
        const existingAnswer = await ctx.db.answer.findUnique({
          where: { questionId: questionId },
        });

        // Create or update the answer
        if (!existingAnswer) {
          await ctx.db.answer.create({
            data: {
              questionId: questionId,
              answer: answerData.answer as string,
            },
          });
        } else {
          await ctx.db.answer.update({
            where: { questionId: questionId },
            data: { answer: answerValue as string },
          });
        }

        // Fetch and return the updated question with its options and answer
        const updatedQuestion = await ctx.db.question.findUnique({
          where: { id: questionId },
          include: {
            answer: true,
            options: true,
            form: true,
          },
        });

        return updatedQuestion;
      }
    }),
});
