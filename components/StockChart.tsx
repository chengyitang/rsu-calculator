"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { VestingEvent } from "@/types";

interface HistoryPoint {
  date: string;
  close: number;
}

interface Props {
  points: HistoryPoint[];
  vestingEvents: VestingEvent[];
  ticker: string;
}

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

function formatDate(dateStr: string) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function StockChart({ points, vestingEvents, ticker }: Props) {
  if (points.length === 0) return null;

  const prices = points.map((p) => p.close);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.1;

  const dateSet = new Set(points.map((p) => p.date));
  const vestDatesInRange = vestingEvents
    .filter((e) => dateSet.has(e.vestDate))
    .map((e) => e.vestDate);

  return (
    <div className="w-full">
      <p className="text-xs text-gray-500 mb-3">
        {ticker} — last 100 trading days
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={points} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDate}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            interval={19}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            tickFormatter={(v) => `$${v.toFixed(0)}`}
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickLine={false}
            axisLine={false}
            width={55}
          />
          <Tooltip
            formatter={(value) => [fmt.format(Number(value)), "Close"]}
            labelFormatter={(label) =>
              new Date(label + "T00:00:00").toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            }
            contentStyle={{
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              fontSize: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          />
          {vestDatesInRange.map((date) => (
            <ReferenceLine
              key={date}
              x={date}
              stroke="#10b981"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: "vest", position: "top", fontSize: 9, fill: "#10b981" }}
            />
          ))}
          <Area
            type="monotone"
            dataKey="close"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#priceGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0, fill: "#3b82f6" }}
          />
        </AreaChart>
      </ResponsiveContainer>
      {vestDatesInRange.length > 0 && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <span className="inline-block w-4 border-t border-dashed border-green-500"></span>
          Vest dates within this window
        </p>
      )}
    </div>
  );
}
