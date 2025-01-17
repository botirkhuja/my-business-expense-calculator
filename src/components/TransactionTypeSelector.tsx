"use client";

export default function TransactionTypeSelector() {
  return (
    <div>
      <label htmlFor="transactionType">Transaction Type</label>
      <select id="transactionType" name="transactionType">
        <option value="credit">Expense</option>
        <option value="debit">Income</option>
      </select>
    </div>
  );
}
