import { Key, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "@/utils/api";
import { Form } from "@prisma/client";
import { EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import Link from "next/link";

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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error?.message}</div>;

  return (
    <div className="h-80 w-full p-5">
      <h2 className="text-sm font-medium text-gray-500">Forms</h2>
      <ul
        role="list"
        className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {allFormData.length !== 0 ? (
          allFormData.map((form) => (
            <li
              key={form.id}
              className="col-span-1 flex-col rounded-md bg-white p-3 shadow-sm"
            >
              <Link href={`/form/${form.id}`}>
                <div className="flex flex-shrink-0 items-center rounded-l-md text-sm font-medium text-black">
                  {form.title}
                </div>
              </Link>
            </li>
          ))
        ) : (
          <></>
        )}
        {/* <li>
          <Link href={"/form/new"}>
            <div className="flex flex-shrink-0 items-center rounded-l-md text-sm font-medium text-black">
              <EllipsisVerticalIcon className="h-5 w-5 text-gray-400" />
            </div>
          </Link>
        </li> */}
      </ul>
    </div>
  );
};

export default Dashboard;
