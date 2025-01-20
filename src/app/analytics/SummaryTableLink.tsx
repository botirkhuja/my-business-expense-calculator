"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AnalyticsSummaryTableLink() {
  const pathName = usePathname();
  return (
    <Link href={`${pathName}/summary-table`} className="px-4 py-2 bg-gray-500">
      Table View
    </Link>
  );
}
