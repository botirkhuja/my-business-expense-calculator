"use client";

import { ICategory } from "@/model/Category";
import CategoriesTable from "./CategoriesTable";
import { getCategories, updateCategory } from "./actions";
import { useEffect, useState } from "react";

export default function CategoriesPage() {
  const [categoriesData, setCategoriesData] = useState<ICategory[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesData = await getCategories();
      setCategoriesData(categoriesData);
    };

    fetchCategories();

    return () => {
      setCategoriesData([]);
    };
  }, []);

  if (!categoriesData.length) return null;

  return (
    <main>
      <h1>Categories Page</h1>
      <CategoriesTable
        data={categoriesData}
        categoryChangeAction={updateCategory}
      />
    </main>
  );
}
