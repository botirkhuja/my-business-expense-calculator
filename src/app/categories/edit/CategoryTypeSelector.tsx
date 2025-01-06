import { ICategory } from "@/model/Category";

interface Props {
  category: ICategory;
  updateCategoryAction: (data: ICategory["categoryType"]) => void;
}

export function CategoryTypeSelector({
  category,
  updateCategoryAction,
}: Props) {
  return (
    <div>
      <label htmlFor="categoryType">Category Type</label>
      <select
        name="categoryType"
        id="categoryType"
        value={category.categoryType || ""}
        onChange={(event) => {
          if (event.target.value !== category.categoryType) {
            updateCategoryAction(
              event.target.value as ICategory["categoryType"],
            );
          }
        }}
      >
        <option disabled value={""}>
          Select type
        </option>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>
    </div>
  );
}
