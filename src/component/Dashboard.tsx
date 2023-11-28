import { Key, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Form } from "@prisma/client";
import { EllipsisVerticalIcon, PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import NewFormModal from "./NewFormModal";
import { Dialog, Transition } from "@headlessui/react";
import moment from "moment";

type SmallForm = {
  id: Key;
  title: String;
  description: String | null;
  updatedAt: Date;
};

function classNames(...classes: any) {
  return classes.filter(Boolean).join(" ");
}

const Dashboard = () => {
  const [open, setOpen] = useState(false);
  const { data: sessionData } = useSession();
  const [allFormData, setAllFormData] = useState<SmallForm[]>([]);
  console.log("runnning");
  const { data, isLoading, isError, error } =
    api.form.getAllFormSmallDisplay.useQuery();

  useEffect(() => {
    if (data) {
      setAllFormData(data);
      console.log(data);
    }
  }, [data]);
  const formatDate = (date: Date) => {
    return moment(date).format("lll");
  };
  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="mx-auto h-80 w-4/5 p-5">
      <h2 className="text-sm font-medium text-gray-500">Forms</h2>
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {allFormData.length !== 0 ? (
          allFormData.map((form) => (
            <li
              key={form.id}
              className="col-span-1 flex flex-col justify-between rounded-md bg-white p-5 shadow-md"
            >
              <Link href={`/form/${form.id}`}>
                <div>
                  <div className="py-2 text-lg font-semibold text-black">
                    {form.title}
                  </div>

                  <div className="pb-6 text-sm font-medium text-black">
                    {form.description}
                  </div>
                </div>
              </Link>
              <div className="border-t-2 border-slate-200 py-2">
                <div className="text-xs font-normal italic text-slate-400">
                  Last updated: {formatDate(form.updatedAt)}
                </div>
                {/* Assuming you have the user's name in the form object */}
              </div>
            </li>
          ))
        ) : (
          <></>
        )}
        <li className="col-span-1 flex-col rounded-md bg-white p-3 px-3 py-5 shadow-md">
          <button
            onClick={() => setOpen(true)}
            className="flex w-full justify-center "
          >
            <div className="flexrounded-l-md font-medium text-black shadow-sm">
              <PlusIcon className="h-5 w-5 text-gray-400" />
            </div>
          </button>
        </li>
      </ul>
      <NewFormModal open={open} setOpen={setOpen} />
    </div>
  );
};

export default Dashboard;
