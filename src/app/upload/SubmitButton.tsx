"use client";

import React from "react";
import { useFormStatus } from "react-dom";

export default function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      className="bg-blue-500 text-white p-4 rounded disabled:bg-gray-500"
      type="submit"
      disabled={pending}
    >
      Submit
    </button>
  );
}
