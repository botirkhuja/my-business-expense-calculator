"use client";

import { useState } from "react";
import { uploadCsvFile } from "./actions";
import SubmitButton from "./SubmitButton";

export default function Home() {
  const [message, setMessage] = useState("");

  const uploadFileToServer = async (event: FormData) => {
    const result = await uploadCsvFile(event);
    if (result?.error) {
      setMessage(result.error);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold pb-24">Upload bank transactions</h1>

      <form
        action={uploadFileToServer}
        className="grid grid-cols-[auto,1fr] gap-4 m-5"
      >
        <label htmlFor="transactionsAccountType" className="block">
          File account type:
        </label>
        <select
          id="transactionsAccountType"
          name="transactionsAccountType"
          defaultValue="expenses"
          required
        >
          <option value="credit">Credit</option>
          <option value="checking">Checking</option>
        </select>

        <label htmlFor="csvFile" className="block">
          CSV file:
        </label>
        <input type="file" name="csvFile" className="w-96 p-4" />
        <SubmitButton />
      </form>
      {message && <p>{message}</p>}
    </main>
  );
}
