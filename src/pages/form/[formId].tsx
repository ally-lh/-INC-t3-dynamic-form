import React, { useState, useEffect, useCallback } from "react";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Layout from "@/component/Layout";
import { Form } from "@prisma/client";
import {
  PencilIcon,
  ArrowPathIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { api } from "@/utils/api";
import { Question, Option, Answer, AnswersState } from "@/utils/Interfaces";
import moment from "moment";

const FormPage = ({
  formId,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  // const router = useRouter();
  // const formId = router.query.formId as string;

  const { data, isLoading, isError, error } = api.form.getFormById.useQuery({
    id: formId,
  });
  const formatSyncDate = (date: Date) => {
    return moment(date).fromNow();
  };
  const [formData, setFormData] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<AnswersState>({});
  const [formStats, setFormStats] = useState<Form>();
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  const {
    mutate: updateQuestionAnswerMutate,
    isLoading: updateQuestionAnswerLoading,
    isError: updateQuestionAnswerError,
  } = api.question.updateQuestionAnswer.useMutation();
  const {
    mutate: updateFormMutate,
    isLoading: updateFormLoading,
    isError: updateFormError,
  } = api.form.updateForm.useMutation();
  const {
    mutate: updateQuestionMutate,
    isLoading: updateQuestionLoading,
    isError: updateQuestionError,
  } = api.question.updateQuestion.useMutation();

  useEffect(() => {
    if (data && data.questions) {
      setFormStats(data);
      setFormData(data.questions);

      const initialAnswers: AnswersState = data.questions.reduce(
        (acc: AnswersState, question: Question) => {
          switch (question.questionType) {
            case "checkbox":
              // For checkboxes, store all options as is, including their selection state
              acc[question.id] = {
                selectedOptions: question.options.filter(
                  (option) => option.isSelected,
                ),
              };
              break;
            case "option":
              const selectedOption = question.options.find(
                (option) => option.isSelected,
              );
              acc[question.id] = {
                selectedOptions: selectedOption ? [selectedOption] : [],
              };
              break;
            default:
              // For other types, store the answer object
              acc[question.id] = { answer: question.answer || null };
              break;
          }
          return acc;
        },
        {},
      );

      setAnswers(initialAnswers);
    }
  }, [data]);

  const handleInputChange = (
    questionId: string,
    value: string,
    optionId?: string,
  ) => {
    // Find the question in formData
    const question = formData.find((q) => q.id === questionId);

    if (!question) return;

    let updatedFormData: Question[] = [...formData];
    let updatedAnswers = { ...answers };

    if (question.questionType === "checkbox" && optionId) {
      // Toggle the isSelected status for the option
      const options = question.options.map((opt) =>
        opt.id === optionId ? { ...opt, isSelected: !opt.isSelected } : opt,
      );
      updatedFormData = updatedFormData.map((q) =>
        q.id === questionId ? { ...q, options } : q,
      );
      updatedAnswers[questionId] = {
        ...updatedAnswers[questionId],
        selectedOptions: options.filter((opt) => opt.isSelected),
      };
    } else if (question.questionType === "option" && optionId) {
      // Toggle the isSelected status for the option
      const options = question.options.map((opt) =>
        opt.id === optionId
          ? { ...opt, isSelected: !opt.isSelected }
          : { ...opt, isSelected: false },
      );
      updatedFormData = updatedFormData.map((q) =>
        q.id === questionId ? { ...q, options } : q,
      );
      updatedAnswers[questionId] = {
        ...updatedAnswers[questionId],
        selectedOptions: options.filter((opt) => opt.isSelected),
      };
    } else {
      // For other types, update the answer directly
      updatedFormData = updatedFormData.map((q) =>
        q.id === questionId
          ? { ...q, answer: { ...q.answer, answer: value } }
          : q,
      );
      updatedAnswers[questionId] = {
        ...updatedAnswers[questionId],
        answer: { ...updatedAnswers[questionId]?.answer, answer: value },
      };
    }

    console.log(updatedFormData, "hello");
    setFormData(updatedFormData);
    setAnswers(updatedAnswers);

    debouncedUpdateAnswer(
      questionId,
      value === "checked"
        ? undefined
        : value === "unchecked"
          ? undefined
          : value,
      value === "checked" || "unchecked"
        ? updatedFormData
            .find((q) => q.id === questionId)
            ?.options?.filter((opt) => opt.isSelected)
        : undefined,
    );
  };

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
  const updateAnswer = async (
    questionId: string,
    answerValue: string,
    selectedOptionIds?: Option[],
  ) => {
    const payload = {
      questionId,
      answerValue,
      selectedOptionIds,
    };

    updateQuestionAnswerMutate(payload, {
      onSuccess: (updatedFormData) => {
        console.log("Form updated successfully");
        setIsUpdating(false);
        setUpdateSuccess(true);
      },
      onError: (error) => {
        console.error("Error updating task:", error);
        setIsUpdating(false);
      },
    });
  };
  const debouncedUpdateAnswer = useCallback(
    debounce((questionId, answerValue, selectedOptionIds) => {
      updateAnswer(questionId, answerValue, selectedOptionIds);
    }, 1000),
    [answers],
  );

  const renderEditIcon = (
    itemId: string,
    itemType: string,
    currentText: string,
  ) => (
    <PencilIcon
      className="ml-2 h-5 w-5 cursor-pointer text-gray-600 hover:text-gray-800"
      onClick={() => handleEditClick(itemId, itemType, currentText)}
    />
  );

  const handleEditClick = (
    itemId: string,
    itemType: string,
    currentText: string,
  ) => {
    console.log("edit clicked", itemId);

    setEditingItemId(`${itemType}-${itemId}`);
    setEditValue(currentText);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    console.log("edit value", e.target.value);
    setEditValue(e.target.value);
  };

  const handleEditSubmit = (itemId: string, itemType: string) => {
    // Logic to update the form or question
    // Reset the editing state
    setIsUpdating(true);
    setUpdateSuccess(false);
    if (itemType === "formTitle" || itemType === "formDescription") {
      const payload = {
        id: formId,
        title: itemType === "formTitle" ? editValue : formStats!.title,
        description:
          itemType === "formDescription" ? editValue : formStats!.description,
      };

      updateFormMutate(payload, {
        onSuccess: (updatedFormData) => {
          setIsUpdating(false);
          setUpdateSuccess(true);
          console.log("Form updated successfully");
          setFormStats(updatedFormData);
        },
        onError: (error) => {
          console.error("Error updating task:", error);
          setIsUpdating(false);
        },
      });
    } else if (itemType === "question") {
      const payload = {
        questionId: itemId,
        questionText: editValue,
      };

      updateQuestionMutate(payload, {
        onSuccess: (updatedFormData) => {
          console.log("Form updated successfully");
          setIsUpdating(false);
          setUpdateSuccess(true);
          setFormData(
            formData.map((question) => {
              if (question.id === itemId) {
                return { ...question, questionText: editValue };
              }
              return question;
            }),
          );
        },
        onError: (error) => {
          setIsUpdating(false);
          console.error("Error updating task:", error);
        },
      });
    }

    setEditingItemId(null);
  };

  const renderEditableText = (
    itemId: string,
    text: string,
    itemType: string,
  ) => {
    const combinedId = `${itemType}-${itemId}`;
    console.log(editingItemId, itemId);

    if (editingItemId === combinedId) {
      return (
        <input
          type="text"
          className="w-full pr-6 outline-none"
          value={editValue}
          onChange={handleEditChange}
          onBlur={() => handleEditSubmit(itemId, itemType)}
          autoFocus
        />
      );
    }
    return (
      <div
        className="flex justify-between"
        onClick={() => handleEditClick(itemId, itemType, text)}
      >
        {text}
        {renderEditIcon(itemId, itemType, text)}
      </div>
    );
  };

  const renderInputField = (question: Question) => {
    const inputValue = answers[question.id] || null;
    const questionAnswer = answers[question.id] || {};

    switch (question.questionType) {
      case "text":
      case "number":
      case "date":
        return (
          <input
            type={question.questionType}
            value={inputValue?.answer?.answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        );

      case "textarea":
        return (
          <textarea
            value={inputValue?.answer?.answer}
            onChange={(e) => handleInputChange(question.id, e.target.value)}
            className="focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none"
          />
        );
      case "checkbox":
        return question.options.map((option) => (
          <div key={option.id}>
            <input
              type="checkbox"
              checked={(questionAnswer.selectedOptions || []).some(
                (selectedOption) => selectedOption.id === option.id,
              )}
              onChange={(e) =>
                handleInputChange(
                  question.id,
                  e.target.checked ? "checked" : "unchecked",
                  option.id,
                )
              }
            />
            <label> {option.optionText}</label>
          </div>
        ));
      case "option":
        return question.options.map((option) => (
          <div key={option.id}>
            <input
              type="radio"
              name={question.id}
              checked={(questionAnswer.selectedOptions || []).some(
                (selectedOption) => selectedOption.id === option.id,
              )}
              onChange={(e) =>
                handleInputChange(
                  question.id,
                  e.target.checked ? option.id : "",
                  option.id,
                )
              }
            />
            <label> {option.optionText}</label>
          </div>
        ));
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
      <div className="mx-auto flex w-3/5 flex-col justify-center p-5">
        <div className="my-4 flex justify-end italic text-gray-400">
          {isUpdating && (
            <div className="flex ">
              <ArrowPathIcon className="h-6 w-6 " />
              Syncing Changes...
            </div>
          )}
          {updateSuccess && !isUpdating && (
            <div className="flex ">
              <CheckIcon className="h-6 w-6" />
              Changes Synced.{" "}
              <span className="ml-2">
                {formStats ? formatSyncDate(formStats.updatedAt) : ""}
              </span>
            </div>
          )}
          {!updateSuccess && !isUpdating && (
            <div className="flex ">
              <CheckIcon className="h-6 w-6" />
              Up to date.
            </div>
          )}
        </div>
        <div className="flex rounded-t-lg border-t-8 border-indigo-500 bg-white p-5 py-8 shadow-md">
          <div className="flex w-9/12 flex-1 flex-col">
            <div className=" mb-3 text-3xl font-semibold">
              {formStats &&
                renderEditableText(formStats.id, formStats.title, "formTitle")}
            </div>
            <div className="text-sm text-gray-500">
              {formStats &&
                renderEditableText(
                  formStats.id,
                  formStats.description as string,
                  "formDescription",
                )}
            </div>
          </div>
        </div>
        <form className="">
          {formData.map((question) => (
            <div
              key={question.id}
              className="my-3 rounded border-l-4 border-indigo-500 bg-white p-5 shadow-md "
            >
              <div className="mb-5 flex">
                <div className="text-md flex-1 font-semibold">
                  {renderEditableText(
                    question.id,
                    question.questionText,
                    "question",
                  )}
                </div>
              </div>
              {renderInputField(question)}
            </div>
          ))}
        </form>
      </div>
    </Layout>
  );
};

export const getServerSideProps = (async (context) => {
  const formId = context.params?.formId;

  if (typeof formId !== "string") {
    throw new Error("Invalid form ID");
  }

  return { props: { formId } };
}) satisfies GetServerSideProps<{
  formId: String;
}>;

export default FormPage;
