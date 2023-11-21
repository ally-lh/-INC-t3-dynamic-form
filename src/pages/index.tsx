import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Link from "next/link";
import Layout from "@/component/Layout";
import Dashboard from "@/component/Dashboard";
import LogInBanner from "@/component/LogInBanner";

import { api } from "@/utils/api";

export default function Home() {
  // const { data: sessionData } = useSession();
  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user !== undefined },
  // );
  return (
    <div className="h-100 w-100 bg-slate-100">
      <Layout>
        <AuthShowcase />
      </Layout>
    </div>
    //     <div className="flex flex-col items-center gap-2">
    //       <p className="text-2xl text-white">
    //         {hello.data ? hello.data.greeting : "Loading tRPC query..."}
    //       </p>
    //       <AuthShowcase />
    // </div>
  );
}

function AuthShowcase() {
  const { data: sessionData } = useSession();
  console.log(sessionData);
  // const { data: secretMessage } = api.post.getSecretMessage.useQuery(
  //   undefined, // no input
  //   { enabled: sessionData?.user !== undefined },
  // );

  return (
    <>{sessionData ? <Dashboard /> : <LogInBanner />}</>
    // <div className="flex flex-col items-center justify-center gap-4">
    //   <p className="text-center text-2xl text-white">
    //     {sessionData && <span>Logged in as {sessionData.user?.name}</span>}
    //     {secretMessage && <span> - {secretMessage}</span>}
    //   </p>
    //   <button
    //     className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
    //     onClick={sessionData ? () => void signOut() : () => void signIn()}
    //   >
    //     {sessionData ? "Sign out" : "Sign in"}
    //   </button>
    // </div>
  );
}
