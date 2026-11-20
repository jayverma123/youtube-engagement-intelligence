import React from 'react';
import { CreatorTakeaway } from '../types';
import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface CreatorTakeawaysProps {
  takeaways: CreatorTakeaway[];
}

export const CreatorTakeawaysPage: React.FC<CreatorTakeawaysProps> = ({ takeaways }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Creator Intelligence & Takeaways</h1>
        <p className="text-sm text-gray-500 mt-1">
          Data-grounded observations extracted directly from historical engagement metrics and ML clustering results.
        </p>
      </div>

      {/* Analytical Caution Callout */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>Analytical Integrity Notice:</strong> All observations below represent observed correlations in historical trending data.
          Correlation does not prove causality; high engagement rates reflect past viewer interactions rather than guaranteed future virality.
        </div>
      </div>

      {/* Dynamic Takeaway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {takeaways.map((item) => (
          <div
            key={item.id}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-gray-300 transition"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
                  {item.category}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-[#FF0000] border border-red-100">
                  {item.metric}
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900">{item.title}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{item.insight}</p>
            </div>

            <div className="pt-4 border-t border-gray-100 bg-gray-50/70 p-3 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                <CheckCircle2 size={14} className="text-emerald-600" />
                Strategic Creator Takeaway
              </div>
              <p className="text-[11px] text-gray-600 leading-normal">{item.recommendation}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
