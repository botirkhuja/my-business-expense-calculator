import CategoriesTable from "./CategoriesTable";
import { getCategories, updateCategory } from "./actions";

export default async function CategoriesPage() {
  const categoriesData = await getCategories();

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
