import { Key, useEffect, Fragment, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Dialog, Transition } from "@headlessui/react";
import { CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import { api } from "@/utils/api";
import { on } from "events";

type NewFormModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function NewFormModal({ open, setOpen }: NewFormModalProps) {
  console.log("entered");

  const router = useRouter();

  const { data: sessionData } = useSession();
  const [title, setTitle] = useState("Untitled Form");
  const [description, setDescription] = useState("");

  const {
    mutate: createFormMutate,
    isLoading: createFormLoading,
    isError: createFormError,
  } = api.form.createForm.useMutation();

  const createForm = () => {
    createFormMutate(
      {
        title: title,
        description: description,
      },
      {
        onSuccess: (data) => {
          router.push(`/form/${data}`);
        },
      },
    );
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  <div className="mt-3">
                    <Dialog.Title
                      as="h2"
                      className="text-base font-bold leading-6 text-gray-900"
                    >
                      Create new form
                    </Dialog.Title>
                    <div className=" mt-3 grid max-w-2xl grid-cols-1 gap-x-6 gap-y-3 ">
                      <div className="">
                        <label
                          htmlFor="form-title"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Title
                        </label>
                        <div className="">
                          <input
                            type="text"
                            name="form-title"
                            id="form-title"
                            value={title}
                            className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="">
                        <label
                          htmlFor="form-description"
                          className="block text-sm font-medium leading-6 text-gray-900"
                        >
                          Description
                        </label>
                        <div className="">
                          <input
                            type="text"
                            name="form-description"
                            id="form-description"
                            value={description}
                            className="block w-full rounded-md border-0 p-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            onChange={(e) => setDescription(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 sm:ml-3 sm:w-auto"
                    onClick={createForm}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
