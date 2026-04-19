"use client";

import { useState } from "react";
import { Company, VestingTranche } from "@/types";

interface Props {
  onSave: (company: Company) => void;
  onClose: () => void;
}

interface Template {
  id: string;
  label: string;
  description: string;
  build: () => VestingTranche[];
}

const TEMPLATES: Template[] = [
  {
    id: "4yr-annual",
    label: "4-year / 1-year cliff (annual)",
    description: "25% each at months 12, 24, 36, 48 — most common",
    build: () => [12, 24, 36, 48].map((m) => ({ monthsFromGrant: m, percentage: 25 })),
  },
  {
    id: "4yr-quarterly",
    label: "4-year / 1-year cliff (quarterly)",
    description: "25% cliff at month 12, then 6.25% every quarter",
    build: () => {
      const tranches: VestingTranche[] = [{ monthsFromGrant: 12, percentage: 25 }];
      for (let m = 15; m <= 48; m += 3) {
        tranches.push({ monthsFromGrant: m, percentage: 6.25 });
      }
      return tranches;
    },
  },
  {
    id: "4yr-monthly",
    label: "4-year / 1-year cliff (monthly)",
    description: "25% cliff at month 12, then ~2.08% each month for 36 months",
    build: () => {
      const tranches: VestingTranche[] = [{ monthsFromGrant: 12, percentage: 25 }];
      const monthly = parseFloat((75 / 36).toFixed(4));
      for (let m = 13; m <= 47; m++) {
        tranches.push({ monthsFromGrant: m, percentage: monthly });
      }
      // Last tranche absorbs rounding so total = 100
      const soFar = 25 + monthly * 35;
      tranches.push({ monthsFromGrant: 48, percentage: parseFloat((100 - soFar).toFixed(4)) });
      return tranches;
    },
  },
  {
    id: "amazon",
    label: "Amazon-style (5 / 15 / 40 / 40)",
    description: "5% year 1, 15% year 2, 20% every 6 months in years 3–4",
    build: () => [
      { monthsFromGrant: 12, percentage: 5 },
      { monthsFromGrant: 24, percentage: 15 },
      { monthsFromGrant: 30, percentage: 20 },
      { monthsFromGrant: 36, percentage: 20 },
      { monthsFromGrant: 42, percentage: 20 },
      { monthsFromGrant: 48, percentage: 20 },
    ],
  },
  {
    id: "google",
    label: "Google-style (front-loaded)",
    description: "25% year 1, 12.5% at 18mo, then 6.25% quarterly",
    build: () => {
      const tranches: VestingTranche[] = [
        { monthsFromGrant: 12, percentage: 25 },
        { monthsFromGrant: 18, percentage: 12.5 },
      ];
      for (let m = 21; m <= 48; m += 3) {
        tranches.push({ monthsFromGrant: m, percentage: 6.25 });
      }
      return tranches;
    },
  },
  {
    id: "3yr-annual",
    label: "3-year annual",
    description: "~33.3% each at months 12, 24, 36",
    build: () => [
      { monthsFromGrant: 12, percentage: 33.33 },
      { monthsFromGrant: 24, percentage: 33.33 },
      { monthsFromGrant: 36, percentage: 33.34 },
    ],
  },
];

const inputClass =
  "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function AddCompanyModal({ onSave, onClose }: Props) {
  const [name, setName] = useState("");
  const [ticker, setTicker] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [tranches, setTranches] = useState<VestingTranche[]>([
    { monthsFromGrant: 12, percentage: 25 },
    { monthsFromGrant: 24, percentage: 25 },
    { monthsFromGrant: 36, percentage: 25 },
    { monthsFromGrant: 48, percentage: 25 },
  ]);

  const totalPct = tranches.reduce((s, t) => s + t.percentage, 0);

  function applyTemplate(id: string) {
    const tpl = TEMPLATES.find((t) => t.id === id);
    if (tpl) setTranches(tpl.build());
    setSelectedTemplate(id);
  }

  function updateTranche(index: number, field: keyof VestingTranche, value: number) {
    setSelectedTemplate("custom");
    setTranches((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  }

  function addTranche() {
    setSelectedTemplate("custom");
    setTranches((prev) => [...prev, { monthsFromGrant: 0, percentage: 0 }]);
  }

  function removeTranche(index: number) {
    setSelectedTemplate("custom");
    setTranches((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    if (!name.trim() || !ticker.trim() || Math.abs(totalPct - 100) > 0.01) return;
    onSave({
      id: `custom_${Date.now()}`,
      name: name.trim(),
      ticker: ticker.trim().toUpperCase(),
      tranches,
      private: isPrivate,
      custom: true,
    });
  }

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplate);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold">Add Company</h2>

        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Private company</span>
          <span className="text-xs text-gray-400">(price entered manually)</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Company name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Netflix" className={inputClass} />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Ticker symbol</label>
            <input value={ticker} onChange={(e) => setTicker(e.target.value)} placeholder="e.g. NFLX" className={inputClass} />
          </div>
        </div>

        {/* Template picker */}
        <div>
          <label className="text-xs text-gray-500 mb-2 block">Vesting schedule template</label>
          <div className="grid grid-cols-1 gap-1.5">
            {TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => applyTemplate(tpl.id)}
                className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                  selectedTemplate === tpl.id
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span className="font-medium">{tpl.label}</span>
                <span className="text-xs text-gray-400 ml-2">{tpl.description}</span>
              </button>
            ))}
            <button
              type="button"
              onClick={() => setSelectedTemplate("custom")}
              className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                selectedTemplate === "custom"
                  ? "border-blue-500 bg-blue-50 text-blue-800"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="font-medium">Custom</span>
              <span className="text-xs text-gray-400 ml-2">Define tranches manually</span>
            </button>
          </div>
          {activeTemplate && (
            <p className="text-xs text-blue-600 mt-1.5">
              {activeTemplate.build().length} tranches loaded — edit below if needed
            </p>
          )}
        </div>

        {/* Tranche editor */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-500">Tranches</label>
            <button onClick={addTranche} className="text-xs text-blue-600 hover:underline">
              + Add tranche
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {tranches.map((t, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="number"
                  value={t.monthsFromGrant}
                  onChange={(e) => updateTranche(i, "monthsFromGrant", Number(e.target.value))}
                  placeholder="Months"
                  className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">mo</span>
                <input
                  type="number"
                  value={t.percentage}
                  onChange={(e) => updateTranche(i, "percentage", Number(e.target.value))}
                  placeholder="%"
                  className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-xs text-gray-400">%</span>
                <button onClick={() => removeTranche(i)} className="text-gray-400 hover:text-red-500 text-sm ml-auto">
                  ✕
                </button>
              </div>
            ))}
          </div>
          <p className={`text-xs mt-2 ${Math.abs(totalPct - 100) < 0.01 ? "text-green-600" : "text-red-500"}`}>
            Total: {totalPct.toFixed(2)}% {Math.abs(totalPct - 100) < 0.01 ? "✓" : "(must equal 100%)"}
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name || !ticker || Math.abs(totalPct - 100) > 0.01}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save company
          </button>
        </div>
      </div>
    </div>
  );
}
