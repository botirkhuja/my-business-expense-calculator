"use client";

import { AnaylyticsRow } from "../types";
import { CurrencyValueFormatterUSD } from "@/lib/CurrencyCellRendererUSD";
import AnalyticsSummaryTableViewCategoryTransactionsButton from "./ViewCategoryTransactionsButton";

interface IProps {
  data: AnaylyticsRow[];
}

export default function AnalyticsSummaryTable(props: IProps) {
  const expenses = props.data.filter((row) => row.category !== "Income");
  const expensesTotal = expenses.reduce((acc, row) => acc + row.amount, 0);
  const income = props.data.filter((row) => row.category === "Income");
  const incomeTotal = income.reduce((acc, row) => acc + row.amount, 0);
  const netProfit = incomeTotal - expensesTotal;
  return (
    <div className="flex gap-2" style={{ width: "100%" }}>
      <div>
        <h4>Expenses</h4>
        <div className="border border-gray-300">
          {expenses.map((row) => (
            <div
              className="text-sm flex justify-between gap-2 p-2"
              key={row.category}
            >
              <AnalyticsSummaryTableViewCategoryTransactionsButton data={row} />
              <span className="spacer flex-1 border-b border-dashed border-gray-300 my-1"></span>
              <div>{CurrencyValueFormatterUSD(row.amount.toString())}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-4 p-2 border border-t-0 border-gray-300">
          <div>Total Expenses</div>
          <div>{CurrencyValueFormatterUSD(expensesTotal.toString())}</div>
        </div>
      </div>
      <div>
        <h4>Income</h4>
        <div className="border border-gray-300">
          {income.map((row) => (
            <div
              className="text-sm flex justify-between gap-2 p-2"
              key={row.category}
            >
              <AnalyticsSummaryTableViewCategoryTransactionsButton data={row} />
              <span className="spacer flex-1 border-b border-dashed border-gray-300 my-1"></span>
              <div>{CurrencyValueFormatterUSD(row.amount.toString())}</div>
            </div>
          ))}
        </div>
        <div className="flex justify-between gap-4 p-2 border border-t-0 border-gray-300">
          <div>Total Income</div>
          <div>{CurrencyValueFormatterUSD(incomeTotal.toString())}</div>
        </div>
      </div>
      <div>
        <h4>Net profit</h4>
        <div className="border border-gray-300">
          <div className="text-sm flex justify-between gap-2 p-2">
            <span>Total income</span>
            <span className="spacer flex-1 border-b border-dashed border-gray-300 my-1"></span>
            <div>{CurrencyValueFormatterUSD(incomeTotal.toString())}</div>
          </div>
          <div className="text-sm flex justify-between gap-2 p-2">
            <span>Total expense</span>
            <span className="spacer flex-1 border-b border-dashed border-gray-300 my-1"></span>
            <div>{CurrencyValueFormatterUSD(expensesTotal.toString())}</div>
          </div>
        </div>
        <div className="flex justify-between gap-4 p-2 border border-t-0 border-gray-300">
          <div>Net profit</div>
          <div className={netProfit > 0 ? "" : "text-red-300"}>
            {CurrencyValueFormatterUSD(netProfit.toString())}
          </div>
        </div>
      </div>
      {/* <AgGridReact
        rowData={props.data}
        columnDefs={columnDefs}
        defaultColDef={defaultColDef}
      /> */}
    </div>
  );
}
