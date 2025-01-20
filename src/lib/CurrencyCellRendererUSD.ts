import { ValueFormatterParams } from "ag-grid-community";

export function CurrencyCellRendererUSD<T>(
  params: ValueFormatterParams<T, string>,
) {
  const { value } = params;

  return CurrencyValueFormatterUSD(value);
}

export function CurrencyValueFormatterUSD(value: string | null | undefined) {
  if (!value) {
    return "$0.00";
  }

  const inrFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });
  return inrFormat.format(parseFloat(value));
}
