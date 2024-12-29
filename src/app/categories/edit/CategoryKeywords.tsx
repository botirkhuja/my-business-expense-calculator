"use client";

import React from "react";

interface Props {
  category: {
    keywords?: string[];
  };
  removeKeywordAction: (keyword: string) => void;
}

export default function CategoryKeywords({
  category,
  removeKeywordAction,
}: Props) {
  if (!category.keywords) {
    return null;
  }

  return (
    <div>
      <h4>Keywords</h4>
      <ul className="flex flex-wrap gap-1">
        {category.keywords?.map((keyword) => (
          <li
            key={keyword}
            className="flex items-center gap-2 border rounded-lg bg-gray-500 px-2 py-0.5"
          >
            <span>{keyword}</span>
            {/* delete icon button */}
            <button
              onClick={() => {
                removeKeywordAction(keyword);
              }}
              className="text-red-500 hover:text-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
