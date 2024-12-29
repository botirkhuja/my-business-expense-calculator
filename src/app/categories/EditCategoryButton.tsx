"use client";

import { CustomCellRendererProps } from "ag-grid-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function EditCategoryButton(props: CustomCellRendererProps) {
  const pathName = usePathname();
  return (
    <Link
      href={`${pathName}/edit?key=${props.data.key}`}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Edit
    </Link>
  );
}
