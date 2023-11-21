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
  const [answers, setAnswers] = useState<AnswersState>({});

  const {
    mutate: updateFormMutate,
    isLoading: updateFormLoading,
    isError: updateFormError,
  } = api.form.updateQuestion.useMutation();

  useEffect(() => {
    if (data) {
      setFormData(data.questions);

      // Initialize answers state with TypeScript type
      const initialAnswers: AnswersState = data.questions.reduce(
        (acc: AnswersState, question: Question) => {
          acc[question.id] = question.answers?.answerText || "";
          return acc;
        },
        {},
      );

      setAnswers(initialAnswers);

      console.log(answers);
    }
  }, [data]);

  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    delay: number,
  ): ((...args: Parameters<F>) => void) => {
    let timer: NodeJS.Timeout;
    return (...args: Parameters<F>) => {
      clearTimeout(timer);
      timer = setTimeout(() => func(...args), delay);
    };
  };

  const updateAnswer = async (questionId: string, answerValue: string) => {
    updateFormMutate(
      {
        questionId: questionId,
        answerValue: answerValue,
      },
      {
        onSuccess: (updatedFormData) => {
          console.log("Form updated successfully");
        },
        onError: (error) => {
          console.error("Error updating task:", error);
        },
      },
    );
  };
  const debouncedUpdateAnswer = useCallback(
    debounce((questionId, answerValue) => {
      updateAnswer(questionId, answerValue);
    }, 1000),
    [answers],
  );

  const handleInputChange = (questionId: string, value: string) => {
    const updatedFormData = formData.map((question) =>
      question.id === questionId
        ? { ...question, answerText: value }
        : question,
    );
    setFormData(updatedFormData);

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionId]: value,
    }));

    debouncedUpdateAnswer(questionId, answers[questionId]);
  };

  const renderInputField = (question: Question) => {
    const inputValue = answers[question.id] || "";
    switch (question.questionType) {
      case "text":
      case "number":
      case "date":
        return (
          <input
            type={question.questionType}
            value={inputValue}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        );

      case "textarea":
        return (
          <textarea
            value={inputValue}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        );

      default:
        return (
          <input
            type="text"
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        );
    }
  };
  return (
    <Layout>
      <form className="mx-auto flex w-3/5 flex-col  justify-center p-5">
        {formData.map((question) => (
          <div key={question.id}>
            <label>{question.questionText}</label>
            {renderInputField(question)}
          </div>
        ))}
      </form>
    </Layout>
  );
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

export default FormPage;
