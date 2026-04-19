"use client";

interface Props {
  vestedShares: number;
  unvestedShares: number;
  vestedValue: number;
  unvestedValue: number;
  totalValue: number;
  originalGrantedValue?: number;
}

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtShares = (n: number) => n.toLocaleString();

export default function ValueSummary({
  vestedShares, unvestedShares, vestedValue, unvestedValue, totalValue, originalGrantedValue,
}: Props) {
  const totalShares = vestedShares + unvestedShares;
  const vestedPct = totalShares > 0 ? (vestedShares / totalShares) * 100 : 0;

  const delta = originalGrantedValue != null ? totalValue - originalGrantedValue : null;
  const deltaPercent = originalGrantedValue ? (delta! / originalGrantedValue) * 100 : null;
  const isUp = delta != null && delta >= 0;

  const cols = delta != null ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-3";

  return (
    <div className={`grid ${cols} gap-4`}>
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-xs text-green-600 font-medium mb-1">Vested</p>
        <p className="text-2xl font-bold text-green-700">{fmt.format(vestedValue)}</p>
        <p className="text-xs text-green-600 mt-1">{fmtShares(vestedShares)} shares</p>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <p className="text-xs text-gray-500 font-medium mb-1">Unvested</p>
        <p className="text-2xl font-bold text-gray-700">{fmt.format(unvestedValue)}</p>
        <p className="text-xs text-gray-500 mt-1">{fmtShares(unvestedShares)} shares</p>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-600 font-medium mb-1">Total package</p>
        <p className="text-2xl font-bold text-blue-700">{fmt.format(totalValue)}</p>
        <p className="text-xs text-blue-600 mt-1">{fmtShares(totalShares)} shares · {vestedPct.toFixed(0)}% vested</p>
      </div>
      {delta != null && originalGrantedValue != null && (
        <div className={`border rounded-xl p-4 ${isUp ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
          <p className={`text-xs font-medium mb-1 ${isUp ? "text-green-600" : "text-red-600"}`}>
            vs. grant value
          </p>
          <p className={`text-2xl font-bold ${isUp ? "text-green-700" : "text-red-700"}`}>
            {isUp ? "+" : ""}{fmt.format(delta)}
          </p>
          <p className={`text-xs mt-1 ${isUp ? "text-green-600" : "text-red-600"}`}>
            {isUp ? "▲" : "▼"} {deltaPercent!.toFixed(1)}% from {fmt.format(originalGrantedValue)}
          </p>
        </div>
      )}
    </div>
  );
}
