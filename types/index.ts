export interface VestingTranche {
  monthsFromGrant: number;
  percentage: number;
}

export type PriceMethod = "spot" | "30day-trailing-avg";

export interface Company {
  id: string;
  name: string;
  ticker: string;
  tranches: VestingTranche[];
  priceMethod?: PriceMethod;
  private?: boolean;
  custom?: boolean;
}

export interface Grant {
  id: string;
  companyId: string;
  grantDate: string;
  totalShares: number;
  label?: string;
  originalValueUSD?: number;
}

export interface VestingEvent {
  vestDate: string;
  shares: number;
  percentage: number;
  vested: boolean;
}

export interface StockQuote {
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}
