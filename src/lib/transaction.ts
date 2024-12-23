export function convertToTransactionType(type: string): "debit" | "credit" {
  const saleOrFeeRegex = /sale|fee/i;
  const refundRegex = /refund/i;
  if (saleOrFeeRegex.test(type)) {
    return "credit";
  }
  if (refundRegex.test(type)) {
    return "debit";
  }
  return type === "debit" ? "debit" : "credit";
}
