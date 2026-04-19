"use client";

import { useState } from "react";
import { Company, Grant } from "@/types";
import { getVestingEvents } from "@/lib/vesting";
import VestingTimeline from "./VestingTimeline";

interface Props {
  grants: Grant[];
  company: Company;
  currentPrice: number | null;
  onRemove: (id: string) => void;
}

export default function GrantList({ grants, company, currentPrice, onRemove }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  if (grants.length === 0) {
    return <p className="text-sm text-gray-400 py-4">No grants yet. Add one above.</p>;
  }

  return (
    <div className="space-y-3">
      {grants.map((grant) => {
        const events = getVestingEvents(grant, company);
        const vestedShares = events.filter((e) => e.vested).reduce((s, e) => s + e.shares, 0);
        const totalShares = events.reduce((s, e) => s + e.shares, 0);
        const isExpanded = expanded[grant.id] ?? false;

        return (
          <div key={grant.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded((prev) => ({ ...prev, [grant.id]: !isExpanded }))}
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-800">
                  {grant.label || `Grant ${grant.grantDate}`}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(grant.grantDate + "T00:00:00").toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  {vestedShares.toLocaleString()} / {totalShares.toLocaleString()} shares vested
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(grant.id);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  Remove
                </button>
                <span className="text-gray-400 text-sm">{isExpanded ? "▲" : "▼"}</span>
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                <VestingTimeline events={events} currentPrice={currentPrice} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
