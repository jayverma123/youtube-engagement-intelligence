import React, { useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { CorrelationMatrix, RelationshipPoint } from '../types';
import { GitCommit, Activity } from 'lucide-react';

interface EngagementPageProps {
  relationshipData: {
    points: RelationshipPoint[];
    correlation: CorrelationMatrix;
  } | null;
}

export const EngagementPage: React.FC<EngagementPageProps> = ({ relationshipData }) => {
  const [xAxisKey, setXAxisKey] = useState<'views' | 'likes' | 'comments'>('views');
  const [yAxisKey, setYAxisKey] = useState<'likes' | 'comments' | 'engagement_rate'>('likes');
  const [useLogScale, setUseLogScale] = useState(true);
  const [correlationType, setCorrelationType] = useState<'pearson' | 'spearman'>('pearson');

  if (!relationshipData || !relationshipData.points) {
    return <div className="p-8 text-center text-gray-500">Loading relationship data...</div>;
  }

  const { points, correlation } = relationshipData;

  const chartPoints = points.map((p) => {
    let xVal = p[xAxisKey];
    let yVal = p[yAxisKey];
    if (useLogScale) {
      xVal = Math.log10(Math.max(1, xVal));
      if (yAxisKey !== 'engagement_rate') {
        yVal = Math.log10(Math.max(1, yVal));
      }
    }
    return {
      ...p,
      plotX: Number(xVal.toFixed(2)),
      plotY: Number(yVal.toFixed(2)),
    };
  });

  const activeMatrix = correlationType === 'spearman' && correlation.spearman_matrix
    ? correlation.spearman_matrix
    : correlation.matrix;

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Engagement Metric Relationships</h1>
          <p className="text-sm text-gray-500 mt-1">
            Analyze mathematical correlations, rank dependencies, and multi-variable interactions between views, likes, and comments.
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer">
            <input
              type="checkbox"
              checked={useLogScale}
              onChange={(e) => setUseLogScale(e.target.checked)}
              className="rounded text-red-600 focus:ring-0"
            />
            Logarithmic Scale (log10)
          </label>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-gray-500">X:</span>
            <select
              value={xAxisKey}
              onChange={(e: any) => setXAxisKey(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded p-1 outline-none text-gray-800"
            >
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="text-gray-500">Y:</span>
            <select
              value={yAxisKey}
              onChange={(e: any) => setYAxisKey(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded p-1 outline-none text-gray-800"
            >
              <option value="likes">Likes</option>
              <option value="comments">Comments</option>
              <option value="engagement_rate">Engagement Rate (%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Scatter Plot */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Activity size={18} className="text-[#FF0000]" />
            Scatter Distribution ({xAxisKey} vs {yAxisKey})
          </h3>
          <span className="text-xs text-gray-500">
            Sample size: {points.length} verified titles
          </span>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis
                type="number"
                dataKey="plotX"
                name={xAxisKey}
                tick={{ fontSize: 11, fill: '#606060' }}
                label={{
                  value: useLogScale ? `log10(${xAxisKey})` : xAxisKey,
                  position: 'insideBottom',
                  offset: -10,
                  fontSize: 12,
                  fill: '#808080'
                }}
              />
              <YAxis
                type="number"
                dataKey="plotY"
                name={yAxisKey}
                tick={{ fontSize: 11, fill: '#606060' }}
                label={{
                  value: useLogScale && yAxisKey !== 'engagement_rate' ? `log10(${yAxisKey})` : yAxisKey,
                  angle: -90,
                  position: 'insideLeft',
                  fontSize: 12,
                  fill: '#808080'
                }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  const data: RelationshipPoint = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-lg text-xs space-y-1">
                      <div className="font-bold text-gray-900 line-clamp-1">{data.title}</div>
                      <div className="text-gray-500">{data.channel_title} • {data.category_name}</div>
                      <div className="pt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-gray-700">
                        <span>Views: {data.views.toLocaleString()}</span>
                        <span>Likes: {data.likes.toLocaleString()}</span>
                        <span>Comments: {data.comments.toLocaleString()}</span>
                        <span className="text-red-600 font-semibold">Rate: {data.engagement_rate}%</span>
                      </div>
                      <div className="text-[10px] text-gray-400 mt-1">Cluster: {data.cluster}</div>
                    </div>
                  );
                }}
              />
              <Scatter data={chartPoints} fill="#FF0000" fillOpacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Correlation Matrix with Pearson / Spearman Switch */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <GitCommit size={18} className="text-[#FF0000]" />
            <h3 className="text-base font-bold text-gray-900">
              {correlationType === 'spearman' ? 'Spearman Rank Correlation Matrix' : 'Pearson Linear Correlation Matrix'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setCorrelationType('pearson')}
              className={`px-3 py-1 rounded transition ${correlationType === 'pearson' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Pearson (Linear)
            </button>
            <button
              onClick={() => setCorrelationType('spearman')}
              className={`px-3 py-1 rounded transition ${correlationType === 'spearman' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}
            >
              Spearman (Rank / Non-linear)
            </button>
          </div>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Note: Correlation measures statistical co-movement (-1 to +1). It strictly demonstrates statistical association, not causal mechanics.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-xs font-semibold text-gray-500 uppercase">Metric</th>
                {correlation.features.map((feat) => (
                  <th key={feat} className="p-3 text-xs font-semibold text-gray-700 uppercase">
                    {feat.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {correlation.features.map((rowFeat, rIdx) => (
                <tr key={rowFeat}>
                  <td className="p-3 text-left font-semibold text-gray-800 uppercase text-xs">
                    {rowFeat.replace('_', ' ')}
                  </td>
                  {activeMatrix[rIdx]?.map((val, cIdx) => {
                    const isDiag = rIdx === cIdx;
                    let bg = 'bg-gray-50';
                    if (!isDiag) {
                      if (val > 0.7) bg = 'bg-red-100 text-red-900 font-bold';
                      else if (val > 0.4) bg = 'bg-red-50 text-red-800';
                      else if (val < 0) bg = 'bg-blue-50 text-blue-800';
                    }
                    return (
                      <td key={cIdx} className={`p-3 rounded ${bg}`}>
                        {val !== undefined ? val.toFixed(3) : '1.000'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
