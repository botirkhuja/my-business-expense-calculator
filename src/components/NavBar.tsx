// components/NavBar.jsx
"use client";

import Link from "next/link";
// import styles from "./NavBar.module.css"; // optional: for styling if desired

export default function NavBar() {
  return (
    <nav>
      <ul className="flex items-center gap-5 m-7">
        <li>
          <Link href="/upload">Upload</Link>
        </li>
        <li>
          <Link href="/transactions">Transactions</Link>
        </li>
        <li>
          <Link href="/analytics">Analytics</Link>
        </li>
        <li>
          <Link href="/categories">Categories</Link>
        </li>
      </ul>
    </nav>
  );
}
