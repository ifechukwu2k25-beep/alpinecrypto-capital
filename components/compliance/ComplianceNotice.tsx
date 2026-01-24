"use client";

import { AlertTriangle } from "lucide-react";

export function ComplianceNotice() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800">
            Performance expectations are not guaranteed. Capital is at risk.
          </p>
          <p className="text-xs text-yellow-700 mt-1">
            AlpineCrypto Capital focuses on disciplined execution to protect clients from market manipulation.
          </p>
        </div>
      </div>
    </div>
  );
}
