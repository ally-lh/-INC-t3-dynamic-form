import { signIn, signOut, useSession } from "next-auth/react";

export default function LogInBanner() {
  return (
    <div className="flex h-screen w-screen items-center justify-center">
      Log In pls
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-black no-underline transition hover:bg-white/20"
        onClick={() => void signIn()}
      >
        Sign In
      </button>
    </div>
  );
}
