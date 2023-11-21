import React, { useState, useEffect, useCallback } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import Layout from "@/component/Layout";

import Dashboard from "@/component/Dashboard";
import { api } from "@/utils/api";

import { Question, Answer } from "@prisma/client";
type AnswersState = Record<string, string>;

const FormPage = ({
  formId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const { data, isLoading, isError, error } = api.form.getFormById.useQuery({
    id: formId,
  });

  const [formData, setFormData] = useState<Question[]>([]);

  const {
    mutate: updateFormMutate,
    isLoading: updateFormLoading,
    isError: updateFormError,
  } = api.form.updateQuestion.useMutation();

  useEffect(() => {
    if (data) {
      setFormData(data.questions);
      console.log(data.questions), "hello";

      // Initialize answers state with TypeScript type
      // const initialAnswers: AnswersState = data.questions.reduce(
      //   (acc: AnswersState, question: Question) => {
      //     switch (question.questionType) {
      //       case "text":
      //       case "number":
      //         acc[question.id] = question.answer?.answer || "";
      //         break;
      //       case "checkbox":
      //         acc[question.id] = question.options?. || "";
      //         break;
      //     }
      //     acc[question.id] = question.answers?.answerText || "";
      //     return acc;
      //   },
      //   {},
      // );

      // setAnswers(initialAnswers);

      // console.log(answers);
    }
  }, [data]);
};

export const getServerSideProps = (async (context) => {
  const formId = context.query.formId;

  if (typeof formId !== "string") {
    throw new Error("Invalid form ID");
  }

  return { props: { formId } };
}) satisfies GetServerSideProps<{
  formId: String;
}>;
