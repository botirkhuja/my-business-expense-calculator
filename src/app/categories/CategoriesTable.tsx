"use client";

import { ICategory } from "@/model/Category";
import {
  AllCommunityModule,
  CellClassParams,
  CellValueChangedEvent,
  ColDef,
  ModuleRegistry,
  ValueFormatterParams,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import EditCategoryButton from "./EditCategoryButton";

ModuleRegistry.registerModules([AllCommunityModule]);

interface CategoriesTableProps {
  data: ICategory[];
  categoryChangeAction: (change: ICategory) => void;
}

export default function CategoriesTable({
  data,
  categoryChangeAction,
}: CategoriesTableProps) {
  const columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      // valueGetter: (params: ValueGetterParams<ICategory, ICategory>) => {
      //   if (params.data === null || params.data === undefined) {
      //     return "";
      //   }
      //   if (params.data.isNew) {
      //     return "Enter new category";
      //   }
      //   return params.data.label;
      // },
      valueFormatter: (params: ValueFormatterParams<ICategory, ICategory>) => {
        if (params.data === null || params.data === undefined) {
          return "";
        }
        // if (params.data.isNew) {
        //   return "Enter new category";
        // }
        return params.data.name;
      },
    },
    {
      headerName: "Type",
      field: "categoryType",
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {
        values: ["income", "expense"],
      },
      valueFormatter: (params: ValueFormatterParams<ICategory, ICategory>) => {
        if (params.data === null || params.data === undefined) {
          return "";
        }

        if (params.data.categoryType === undefined) {
          return "";
        }

        return params.data.categoryType;
      },
    },
    {
      headerName: "Keywords",
      field: "keywords",
      valueFormatter: (params: ValueFormatterParams<ICategory, ICategory>) => {
        if (params.data === null || params.data === undefined) {
          return "";
        }

        if (params.data.keywords === undefined) {
          return "";
        }

        return params.data.keywords.join(", ");
      },
      editable: false,
    },
    // {
    //   headerName: "Regex",
    //   field: "regex",
    // },
    {
      headerName: "Icon",
      field: "icon",
    },
    {
      headerName: "Actions",
      cellRenderer: EditCategoryButton,
      sortable: false,
      filter: false,
      resizable: false,
      editable: false,
      width: 100,
    },
  ];

  const defaultColDef: ColDef = {
    sortable: false,
    filter: false,
    resizable: true,
    editable: true,
    cellClass: (params: CellClassParams<ICategory>) => {
      if (params.data === null || params.data === undefined) {
        return null;
      }

      // if (params.data.isNew) {
      //   return "bg-green-200 text-red-900";
      // }
      return null;
    },
  };

  const pathName = usePathname();

  const handleCellValueChange = (params: CellValueChangedEvent<ICategory>) => {
    const newData = params.data;
    categoryChangeAction(newData);
  };

  return (
    <div className="grid gap-4">
      <div>
        <Link
          href={`${pathName}/create`}
          className="px-4 py-2 bg-gray-500 rounded"
        >
          {" "}
          Add New Category{" "}
        </Link>
      </div>
      <div
        className="ag-theme-alpine"
        style={{ height: "80vh", width: "100%" }}
      >
        <AgGridReact
          rowData={data}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          onCellValueChanged={handleCellValueChange}
        />
      </div>
    </div>
  );
}
