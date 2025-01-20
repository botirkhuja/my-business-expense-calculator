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
      console.log("categoriesData", categoriesData);
      setCategoriesData(categoriesData);
    };

    fetchCategories();

    return () => {
      setCategoriesData([]);
    };
  }, []);

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
