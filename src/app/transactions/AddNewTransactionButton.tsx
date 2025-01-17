"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AddNewTransactionButton() {
  const pathName = usePathname();
  return (
    <Link className="px-4 py-2 bg-gray-500" href={`${pathName}/new`}>
      Add New Transaction
    </Link>
  );
}
