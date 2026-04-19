"use client";

import { VestingEvent } from "@/types";

interface Props {
  events: VestingEvent[];
  currentPrice: number | null;
}

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const fmtShares = (n: number) => n.toLocaleString();

export default function VestingTimeline({ events, currentPrice }: Props) {
  if (events.length === 0) return null;

  const sorted = [...events].sort((a, b) => a.vestDate.localeCompare(b.vestDate));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-4 font-medium">Vest date</th>
            <th className="pb-2 pr-4 font-medium">Shares</th>
            <th className="pb-2 pr-4 font-medium">%</th>
            {currentPrice && <th className="pb-2 font-medium">Value</th>}
            <th className="pb-2"></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((event, i) => (
            <tr key={i} className={`border-b border-gray-50 ${event.vested ? "text-gray-800" : "text-gray-400"}`}>
              <td className="py-2 pr-4 font-mono">
                {new Date(event.vestDate + "T00:00:00").toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="py-2 pr-4">{fmtShares(event.shares)}</td>
              <td className="py-2 pr-4">{event.percentage}%</td>
              {currentPrice && (
                <td className="py-2">{fmt.format(event.shares * currentPrice)}</td>
              )}
              <td className="py-2 pl-2">
                {event.vested ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Vested</span>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Pending</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
