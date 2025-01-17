"use client";

import { TransactionRecord } from "@/model/Transaction";
import { CustomCellRendererProps } from "ag-grid-react";
import { uploadReceipt } from "../upload/actions";
import { useState } from "react";
import { deleteTransactionById } from "./actions";
import { useRouter } from "next/navigation";

export default function RowActionsOptionSelector(
  props: CustomCellRendererProps<TransactionRecord>,
) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);

  const updateUploadSuccessStatus = (condition: boolean) => {
    setUploadSuccess(condition);
    setTimeout(() => {
      setUploadSuccess(null);
    }, 2000);
  };

  const handleChangeFileInputChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    console.log("file", file, props.data);
    if (!file) return;

    const transaction = props.data;

    if (!transaction) {
      console.error("Transaction not found");
      return;
    }

    setPending(true);
    const response = await uploadReceipt(file, transaction._id);
    if (response.error) {
      console.error("Receipt upload error:", response.error);
      setPending(false);
      updateUploadSuccessStatus(false);
      return;
    }

    setPending(false);
    updateUploadSuccessStatus(true);
  };

  const handleDeleteTransaction = async () => {
    if (!props.data) {
      console.error("Transaction not found");
      return;
    }

    setPending(true);
    try {
      await deleteTransactionById(props.data._id);
      router.refresh();
    } catch (error) {
      console.error("Transaction delete error:", error);
      setPending(false);
      return;
    }
  };

  const handleActionSelectorChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    event.preventDefault();
    const selectedAction = event.target.value;
    if (selectedAction === "upload") {
      const input = (
        event.target as HTMLSelectElement
      ).parentElement?.querySelector(
        'input[name="receipt"]',
      ) as HTMLInputElement | null;
      if (input) {
        input.click();
      }
    }

    if (selectedAction === "delete") {
      handleDeleteTransaction();
    }
  };

  return (
    <form>
      <input
        type="file"
        name="receipt"
        onChange={handleChangeFileInputChange}
        className="hidden"
      />

      <select
        name="actionSelector"
        id="actionSelector"
        value={""}
        onChange={handleActionSelectorChange}
        disabled={pending}
        className={`
          px-4 py-1 rounded disabled:bg-gray-500 leading-5 transition-colors
          ${pending ? "cursor-not-allowed" : "cursor-pointer"}
          ${uploadSuccess === true ? "bg-green-500" : ""}
          ${uploadSuccess === false ? "bg-red-500" : ""}
        `}
      >
        <option disabled value={""}>
          Actions
        </option>
        <option value="upload">Upload image</option>
        <option value="delete">Delete transaction</option>
      </select>

      {/* <button
        onClick={
          // trigger input element
          (event) => {
            event.preventDefault();
            const input = (
              event.target as HTMLButtonElement
            ).parentElement?.querySelector(
              'input[name="receipt"]',
            ) as HTMLInputElement | null;
            if (input) {
              input.click();
            }
          }
        }
        disabled={pending}
        className={`
          bg-blue-500 text-white px-4 py-1 rounded disabled:bg-gray-500 leading-5 transition-colors
          ${pending ? "cursor-not-allowed" : "cursor-pointer"}
          ${uploadSuccess === true ? "bg-green-500" : ""}
          ${uploadSuccess === false ? "bg-red-500" : ""}
        `}
      >
        Upload
      </button> */}
    </form>
  );
}
