"use client";

import { FormEvent, useState } from "react";

interface AddCategoryKeywordProps {
  addKeywordAction: (keyword: string) => void;
}

export function AddCategoryKeyword({
  addKeywordAction,
}: AddCategoryKeywordProps) {
  const [keyword, setKeyword] = useState<string>("");

  return (
    <div className="flex gap-2">
      <label htmlFor="keyword">
        Keyword:
        <input
          type="text"
          placeholder="Keyword"
          name="keyword"
          id="keyword"
          onInput={(event: FormEvent<HTMLInputElement>) => {
            const target = event.target as HTMLInputElement;
            setKeyword(target.value);
          }}
        />
      </label>
      <button
        className="px-4 py-2 bg-gray-500 hover:bg-gray-400"
        onClick={() => {
          // const keyword = document.querySelector("input")?.value;
          if (keyword) addKeywordAction(keyword);
        }}
      >
        Add Keyword
      </button>
    </div>
  );
}
