"use client";

interface ConvertRegexToKeywordsButtonProps {
  convertAction: () => void;
}

export default function ConvertRegexToKeywordsButton({
  convertAction,
}: ConvertRegexToKeywordsButtonProps) {
  return (
    <button onClick={convertAction} className="px-4 py-2 bg-gray-500">
      Convert Regex to Keywords
    </button>
  );
}
