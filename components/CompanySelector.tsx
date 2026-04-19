"use client";

import { Company } from "@/types";

interface Props {
  companies: Company[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddNew: () => void;
}

export default function CompanySelector({ companies, selectedId, onSelect, onAddNew }: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <label className="text-sm font-medium text-gray-600">Company</label>
      <select
        value={selectedId ?? ""}
        onChange={(e) => onSelect(e.target.value)}
        className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>
          Select a company…
        </option>
        {companies.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name} {c.custom ? "★" : ""}
          </option>
        ))}
      </select>
      <button
        onClick={onAddNew}
        className="text-sm text-blue-600 hover:text-blue-800 underline underline-offset-2"
      >
        + Add company
      </button>
    </div>
  );
}
