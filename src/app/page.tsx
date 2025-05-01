"use client";

import { SignIn, SignUp } from "@clerk/nextjs";
import { useState } from "react";

export default function LandingPage() {
  const [mode, ] = useState<"sign-in" | "sign-up">("sign-in");

  return (
    <div className="flex h-screen">
      {/* Left - Image Section */}
      <div
        className="w-1/2 bg-cover bg-center m-5 rounded-lg"
        style={{ backgroundImage: "url(/pattern.png)" }}
      />

      {/* Right - Auth Section */}
      <div className="w-1/2 flex flex-col justify-center items-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {mode === "sign-in" ? (
            <SignIn routing="hash" />
          ) : (
            <SignUp routing="hash" />
          )}
        </div>
      </div>
    </div>
  );
}
