"use client";

import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      setMessage(data.message || data.error || "Something went wrong.");
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Failed to upload file.");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold pb-24">Upload bank transactions</h1>

      <label htmlFor="source" className="block">
        Source:
      </label>
      <label htmlFor="csvFile" className="block">
        CSV file:
      </label>
      <input
        type="file"
        name="csvFile"
        className="w-96 p-4"
        onChange={handleFileChange}
      />
      <button
        className="bg-blue-500 text-white p-4 rounded"
        onClick={handleUpload}
      >
        Submit
      </button>
      {message && <p>{message}</p>}
    </main>
  );
}
