"use client";
import { use, useEffect, useState } from "react";
import { ICategory } from "@/model/Category";
import {
  addKeywordToCategoryById,
  convertCategoryRegexToKeywords,
  getCategoryByKey,
  removeKeywordFromCategoryById,
  updateCategoryType,
} from "../actions";
import ConvertRegexToKeywordsButton from "./ConvertRegexToKeywordsButton";
import CategoryKeywords from "./CategoryKeywords";
import { AddCategoryKeyword } from "./AddCategoryKeyword";
import { CategoryTypeSelector } from "./CategoryTypeSelector";

export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { key: categoryKey } = use(searchParams);
  const [category, setCategory] = useState<ICategory | null>(null);

  useEffect(() => {
    const getCategory = async () => {
      try {
        const innerCategory = await getCategoryByKey(categoryKey as string);
        if (!innerCategory) {
          throw new Error("Category not found");
        }
        setCategory(innerCategory);
        console.log("category", innerCategory);
      } catch {
        console.log("category not found");
      }
    };

    getCategory();
  }, [categoryKey]);

  if (category === null) {
    return <div>Loading...</div>;
  }

  const convertRegexToKeywords = async () => {
    const updatedCategory = await convertCategoryRegexToKeywords(category._id);
    setCategory(updatedCategory);
  };

  const addCategoryKeyword = async (keyword: string) => {
    try {
      const updatedCategory = await addKeywordToCategoryById(
        category._id,
        keyword,
      );
      setCategory(updatedCategory);
    } catch (error) {
      console.error(error);
    }
  };

  const removeCategoryKeyword = async (keyword: string) => {
    try {
      const updatedCategory = await removeKeywordFromCategoryById(
        category._id,
        keyword,
      );
      setCategory(updatedCategory);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateCategoryType = async (type: ICategory["categoryType"]) => {
    try {
      const updatedCategory = await updateCategoryType(category._id, type);
      setCategory(updatedCategory);
      console.log("Category type updated");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="grid gap-2">
      <h1>Category Page</h1>
      <p>This page shows the details of a category.</p>
      <p>Category name: {category.name}</p>
      <p>Regex: {category.regex}</p>
      <CategoryTypeSelector
        category={category}
        updateCategoryAction={handleUpdateCategoryType}
      />
      <ConvertRegexToKeywordsButton convertAction={convertRegexToKeywords} />
      <CategoryKeywords
        category={category}
        removeKeywordAction={removeCategoryKeyword}
      />
      <AddCategoryKeyword addKeywordAction={addCategoryKeyword} />
    </main>
  );
}
