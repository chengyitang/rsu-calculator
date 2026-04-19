"use client";

import { useEffect, useMemo, useState } from "react";
import { Company, Grant, StockQuote } from "@/types";
import { BUILTIN_COMPANIES } from "@/lib/companies";
import { loadGrants, saveGrants, loadCustomCompanies, saveCustomCompanies } from "@/lib/storage";
import { calcGrantsSummary } from "@/lib/vesting";
import { getVestingEvents } from "@/lib/vesting";
import CompanySelector from "@/components/CompanySelector";
import AddCompanyModal from "@/components/AddCompanyModal";
import GrantForm from "@/components/GrantForm";
import GrantList from "@/components/GrantList";
import ValueSummary from "@/components/ValueSummary";
import StockChart from "@/components/StockChart";

export default function Home() {
  const [customCompanies, setCustomCompanies] = useState<Company[]>([]);
  const [grants, setGrants] = useState<Grant[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [showAddCompany, setShowAddCompany] = useState(false);

  // Public company price state
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [historyPoints, setHistoryPoints] = useState<{ date: string; close: number }[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Private company manual price state
  const [manualPriceInput, setManualPriceInput] = useState("");

  const allCompanies = useMemo(
    () => [...BUILTIN_COMPANIES, ...customCompanies],
    [customCompanies]
  );

  const selectedCompany = allCompanies.find((c) => c.id === selectedCompanyId) ?? null;
  const companyGrants = grants.filter((g) => g.companyId === selectedCompanyId);

  const effectivePrice: number | null = selectedCompany?.private
    ? (manualPriceInput ? Number(manualPriceInput) : null)
    : (quote?.price ?? null);

  useEffect(() => {
    setGrants(loadGrants());
    setCustomCompanies(loadCustomCompanies());
  }, []);

  function fetchQuote(ticker: string) {
    setQuote(null);
    setQuoteError(null);
    setQuoteLoading(true);
    fetch(`/api/stock?ticker=${ticker}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setQuote(data);
      })
      .catch((e) => setQuoteError(e.message))
      .finally(() => setQuoteLoading(false));
  }

  function fetchHistory(ticker: string) {
    setHistoryPoints([]);
    setHistoryLoading(true);
    fetch(`/api/stock/history?ticker=${ticker}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.points) setHistoryPoints(data.points);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }

  useEffect(() => {
    if (!selectedCompany) {
      setQuote(null);
      setHistoryPoints([]);
      setManualPriceInput("");
      return;
    }
    if (selectedCompany.private) {
      setQuote(null);
      setHistoryPoints([]);
      return;
    }
    fetchQuote(selectedCompany.ticker);
    fetchHistory(selectedCompany.ticker);
  }, [selectedCompany?.id]);

  function handleAddGrant(grant: Grant) {
    const updated = [...grants, grant];
    setGrants(updated);
    saveGrants(updated);
  }

  function handleRemoveGrant(id: string) {
    const updated = grants.filter((g) => g.id !== id);
    setGrants(updated);
    saveGrants(updated);
  }

  function handleAddCompany(company: Company) {
    const updated = [...customCompanies, company];
    setCustomCompanies(updated);
    saveCustomCompanies(updated);
    setSelectedCompanyId(company.id);
    setShowAddCompany(false);
  }

  const summary = useMemo(() => {
    if (!selectedCompany || !effectivePrice) return null;
    return calcGrantsSummary(companyGrants, selectedCompany, effectivePrice);
  }, [companyGrants, selectedCompany, effectivePrice]);

  const fmtPrice = (p: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(p);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">RSU Calculator</h1>
            <p className="text-sm text-gray-500 mt-1">Track your vesting schedule and current package value.</p>
          </div>
          <button
            onClick={() => {
              if (!confirm("Clear all grants and custom companies? This cannot be undone.")) return;
              localStorage.removeItem("rsu_grants");
              localStorage.removeItem("rsu_custom_companies");
              setGrants([]);
              setCustomCompanies([]);
              setSelectedCompanyId(null);
            }}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 rounded-lg px-3 py-1.5"
          >
            Reset data
          </button>
        </div>

        {/* Company selector + price */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <CompanySelector
            companies={allCompanies}
            selectedId={selectedCompanyId}
            onSelect={setSelectedCompanyId}
            onAddNew={() => setShowAddCompany(true)}
          />

          {selectedCompany && (
            <>
              {/* Private company: manual price input */}
              {selectedCompany.private ? (
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Private</span>
                  <label className="text-xs text-gray-500">Current share price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
                    <input
                      type="number"
                      value={manualPriceInput}
                      onChange={(e) => setManualPriceInput(e.target.value)}
                      placeholder="Enter secondary market price"
                      min={0.01}
                      step={0.01}
                      className="border border-gray-300 rounded-lg pl-6 pr-3 py-2 text-sm text-gray-900 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-xs text-gray-400">e.g. from Forge, Hiive, or EquityZen</span>
                </div>
              ) : (
                /* Public company: auto-fetched price */
                <>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs text-gray-500 font-medium">{selectedCompany.ticker}</span>
                    {quoteLoading && <span className="text-xs text-gray-400">Fetching price…</span>}
                    {quoteError && <span className="text-xs text-red-500">Failed to load price: {quoteError}</span>}
                    {quote && !quoteLoading && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-lg font-semibold text-gray-900">{fmtPrice(quote.price)}</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${quote.change >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {quote.change >= 0 ? "+" : ""}{fmtPrice(quote.change)} ({quote.changePercent >= 0 ? "+" : ""}{quote.changePercent.toFixed(2)}%)
                        </span>
                        <span className="text-xs text-gray-400">as of {quote.lastUpdated}</span>
                      </div>
                    )}
                    <button
                      onClick={() => { fetchQuote(selectedCompany.ticker); fetchHistory(selectedCompany.ticker); }}
                      disabled={quoteLoading}
                      className="ml-auto text-xs text-gray-400 hover:text-blue-600 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      <svg className={`w-3.5 h-3.5 ${quoteLoading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Refresh
                    </button>
                  </div>
                  {(historyLoading || historyPoints.length > 0) && (
                    <div className="mt-2">
                      {historyLoading && <p className="text-xs text-gray-400">Loading chart…</p>}
                      {!historyLoading && historyPoints.length > 0 && (
                        <StockChart
                          points={historyPoints}
                          ticker={selectedCompany.ticker}
                          vestingEvents={companyGrants.flatMap((g) => getVestingEvents(g, selectedCompany))}
                        />
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Grants */}
        {selectedCompany && (
          <>
            <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Add a grant</h2>
                <GrantForm company={selectedCompany} onAdd={handleAddGrant} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Grants <span className="text-gray-400 font-normal">({companyGrants.length})</span>
                </h2>
                <GrantList
                  grants={companyGrants}
                  company={selectedCompany}
                  currentPrice={effectivePrice}
                  onRemove={handleRemoveGrant}
                />
              </div>
            </div>

            {summary && companyGrants.length > 0 && (
              <ValueSummary
                vestedShares={summary.vestedShares}
                unvestedShares={summary.unvestedShares}
                vestedValue={summary.vestedValue}
                unvestedValue={summary.unvestedValue}
                totalValue={summary.totalValue}
                originalGrantedValue={
                  companyGrants.some((g) => g.originalValueUSD != null)
                    ? companyGrants.reduce((s, g) => s + (g.originalValueUSD ?? 0), 0)
                    : undefined
                }
              />
            )}
          </>
        )}

        {!selectedCompany && (
          <div className="text-center py-16 text-gray-400 text-sm">
            Select a company to get started.
          </div>
        )}
      </div>

      {showAddCompany && (
        <AddCompanyModal onSave={handleAddCompany} onClose={() => setShowAddCompany(false)} />
      )}
    </main>
  );
}
