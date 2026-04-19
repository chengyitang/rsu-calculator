"use client";

import { useEffect, useState } from "react";
import { Company, Grant } from "@/types";
import { getAmazonReferenceDate, formatDateISO } from "@/lib/referenceDate";

interface Props {
  company: Company;
  onAdd: (grant: Grant) => void;
}

type InputMode = "amount" | "shares";

const inputClass =
  "border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function GrantForm({ company, onAdd }: Props) {
  const [mode, setMode] = useState<InputMode>("amount");
  const [label, setLabel] = useState("");

  // Amount mode
  const [onboardDate, setOnboardDate] = useState("");
  const [grantAmount, setGrantAmount] = useState("");
  const [avgPrice, setAvgPrice] = useState<number | null>(null);
  const [avgInfo, setAvgInfo] = useState<{ periodStart: string; periodEnd: string; referenceDate: string } | null>(null);
  const [avgLoading, setAvgLoading] = useState(false);
  const [avgError, setAvgError] = useState<string | null>(null);
  // Manual price override for non-30day-avg companies
  const [manualPrice, setManualPrice] = useState("");

  // Shares mode
  const [grantDate, setGrantDate] = useState("");
  const [totalShares, setTotalShares] = useState("");

  const is30DayAvg = company.priceMethod === "30day-trailing-avg";

  useEffect(() => {
    if (!onboardDate || mode !== "amount") return;
    if (!is30DayAvg) return;

    const start = new Date(onboardDate + "T00:00:00");
    const refDate = getAmazonReferenceDate(start);
    const refDateStr = formatDateISO(refDate);

    setAvgPrice(null);
    setAvgInfo(null);
    setAvgError(null);
    setAvgLoading(true);

    fetch(`/api/stock/avg?ticker=${company.ticker}&referenceDate=${refDateStr}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setAvgPrice(data.avg);
        setAvgInfo({ periodStart: data.periodStart, periodEnd: data.periodEnd, referenceDate: refDateStr });
      })
      .catch((e) => setAvgError(e.message))
      .finally(() => setAvgLoading(false));
  }, [onboardDate, mode, is30DayAvg, company.ticker]);

  const effectivePrice = is30DayAvg ? avgPrice : (manualPrice ? Number(manualPrice) : null);
  const estimatedShares =
    effectivePrice && grantAmount && Number(grantAmount) > 0
      ? Math.round(Number(grantAmount) / effectivePrice)
      : null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    let shares: number;
    let date: string;

    if (mode === "amount") {
      if (!onboardDate || !grantAmount || !effectivePrice || Number(grantAmount) <= 0) return;
      shares = Math.round(Number(grantAmount) / effectivePrice);
      date = onboardDate;
    } else {
      if (!grantDate || !totalShares || Number(totalShares) <= 0) return;
      shares = Number(totalShares);
      date = grantDate;
    }

    onAdd({
      id: `grant_${Date.now()}`,
      companyId: company.id,
      grantDate: date,
      totalShares: shares,
      label: label.trim() || undefined,
      originalValueUSD: mode === "amount" && grantAmount ? Number(grantAmount) : undefined,
    });

    setLabel("");
    setOnboardDate("");
    setGrantAmount("");
    setAvgPrice(null);
    setAvgInfo(null);
    setManualPrice("");
    setGrantDate("");
    setTotalShares("");
  }

  const canSubmit =
    mode === "amount"
      ? !!onboardDate && !!grantAmount && Number(grantAmount) > 0 && !!effectivePrice
      : !!grantDate && !!totalShares && Number(totalShares) > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("amount")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === "amount"
              ? "bg-white text-gray-800 shadow-sm font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          By dollar value
        </button>
        <button
          type="button"
          onClick={() => setMode("shares")}
          className={`px-3 py-1 text-xs rounded-md transition-colors ${
            mode === "shares"
              ? "bg-white text-gray-800 shadow-sm font-medium"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          By share count
        </button>
      </div>

      <div className="flex items-end gap-3 flex-wrap">
        <div>
          <label className="text-xs text-gray-500 mb-1 block">Label (optional)</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. New hire grant"
            className={`${inputClass} w-44`}
          />
        </div>

        {mode === "amount" ? (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                {is30DayAvg ? "Onboard date" : "Grant date"}
              </label>
              <input
                type="date"
                value={onboardDate}
                onChange={(e) => setOnboardDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">Grant value (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                <input
                  type="number"
                  value={grantAmount}
                  onChange={(e) => setGrantAmount(e.target.value)}
                  placeholder="e.g. 111531"
                  min={1}
                  required
                  className={`${inputClass} w-36 pl-6`}
                />
              </div>
            </div>

            {/* Non-Amazon: manual price input */}
            {!is30DayAvg && (
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Stock price at grant</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                  <input
                    type="number"
                    value={manualPrice}
                    onChange={(e) => setManualPrice(e.target.value)}
                    placeholder="e.g. 185.00"
                    min={0.01}
                    step={0.01}
                    required
                    className={`${inputClass} w-32 pl-6`}
                  />
                </div>
              </div>
            )}

            {/* Amazon: show auto-calculated result */}
            {is30DayAvg && onboardDate && (
              <div className="self-end pb-2 min-w-[140px]">
                {avgLoading && <p className="text-xs text-gray-400">Calculating avg price…</p>}
                {avgError && <p className="text-xs text-red-500">{avgError}</p>}
                {avgPrice && !avgLoading && (
                  <div className="space-y-0.5">
                    <p className="text-xs text-gray-500">
                      Avg price:{" "}
                      <span className="font-semibold text-gray-800">
                        ${avgPrice.toFixed(2)}
                      </span>
                    </p>
                    {avgInfo && (
                      <p className="text-xs text-gray-400">
                        30 days ending {avgInfo.periodEnd}
                      </p>
                    )}
                    {estimatedShares !== null && (
                      <p className="text-xs text-gray-500">
                        ≈{" "}
                        <span className="font-semibold text-gray-800">
                          {estimatedShares.toLocaleString()}
                        </span>{" "}
                        shares
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Non-Amazon estimated shares */}
            {!is30DayAvg && estimatedShares !== null && (
              <p className="text-xs text-gray-400 self-end pb-2">
                ≈ {estimatedShares.toLocaleString()} shares
              </p>
            )}
          </>
        ) : (
          <>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Grant date</label>
              <input
                type="date"
                value={grantDate}
                onChange={(e) => setGrantDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Total shares</label>
              <input
                type="number"
                value={totalShares}
                onChange={(e) => setTotalShares(e.target.value)}
                placeholder="e.g. 100"
                min={1}
                required
                className={`${inputClass} w-32`}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Add grant
        </button>
      </div>
    </form>
  );
}
