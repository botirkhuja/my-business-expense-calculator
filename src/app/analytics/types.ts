export type AnalyticsRange = "year" | "month" | "week" | "day";

export type BarChartDataRow = Record<string, string | number>;

export interface GetAnalyticsResponse {
  data: AnaylyticsRow[] | BarChartDataRow[];
  start: Date;
  end: Date;
  keys?: string[];
}

export interface AnaylyticsRow {
  amount: number;
  category: string;
}
