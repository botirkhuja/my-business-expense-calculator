"use client";

import React from "react";

interface Props {
  category: {
    keywords?: string[];
  };
}

export default function CategoryKeywords({ category }: Props) {
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
            className="border rounded-lg bg-gray-500 px-2 py-0.5"
          >
            {keyword}
          </li>
        ))}
      </ul>
    </div>
  );
}
