"use client";

import TransactionTypeSelector from "@/components/TransactionTypeSelector";
import { registerNewTransaction } from "../actions";

export default function AddNewTransactionManually() {
  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const date = formData.get("transactionDate") as string;
    const transactionDate = new Date(date);
    const description = formData.get("description") as string;
    const amount = formData.get("amount") as string;
    const transactionType = formData.get("transactionType") as
      | "debit"
      | "credit";
    registerNewTransaction({
      transactionDate,
      description,
      amount,
      transactionType,
    });
    console.log({ date, description, amount, type: transactionType });
  };

  return (
    <main>
      <h1>Add New Transaction Manually</h1>
      <form className="grid gap-3" onSubmit={handleFormSubmit}>
        <label>
          Date:
          <input type="date" name="transactionDate" />
        </label>
        <label>
          Description:
          <input type="text" name="description" />
        </label>
        <label>
          Amount:
          <input type="number" name="amount" />
        </label>
        <TransactionTypeSelector />
        <div>
          <button className="px-4 py-2 bg-gray-500" type="submit">
            Add Transaction
          </button>
        </div>
      </form>
    </main>
  );
}
