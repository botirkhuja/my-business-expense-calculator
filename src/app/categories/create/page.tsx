"use client";

import { createCategory } from "../actions";

export default function NewCategoryPage() {
  const formAction = async (formData: FormData) => {
    const result = await createCategory(formData);
    console.log(result);
  };

  return (
    <main>
      <h1>New Category</h1>
      <p>This page will allow you to create a new category.</p>
      <form action={formAction} className="grid grid-cols-[auto,1fr] gap-4 m-5">
        <label htmlFor="name">Name</label>
        <input type="text" id="name" name="name" required />
        <label htmlFor="regex">Regex</label>
        <input type="text" id="regex" name="regex" required />
        <label htmlFor="icon">icon</label>
        <input type="text" id="icon" name="icon" required />
        <label htmlFor="key">Key</label>
        <input type="text" id="key" name="key" required />
        {/* <p aria-live="polite">{JSON.stringify(state?.errors)}</p> */}
        <button type="submit" className="px-4 py-2 bg-gray-500">
          Create Category
        </button>
      </form>
    </main>
  );
}
