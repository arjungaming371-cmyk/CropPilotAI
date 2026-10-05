import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

export default function DisclaimerBox({ text }) {
  return (
    <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs leading-relaxed">
      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold text-amber-950 mb-0.5">Agricultural Compliance & Chemical Safety Notice</p>
        <p className="text-amber-800">
          {text || 'CropPilot provides predictive diagnostic guidance powered by AI. Always verify chemical rates, target pest labels, and local pesticide regulations with certified agricultural extension agents before spraying.'}
        </p>
      </div>
    </div>
  );
}
