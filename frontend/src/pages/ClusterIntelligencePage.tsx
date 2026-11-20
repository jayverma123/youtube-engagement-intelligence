import React, { useState } from 'react';
import { ClusterSummary, RelationshipPoint } from '../types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { Layers } from 'lucide-react';

interface ClusterIntelligenceProps {
  clusters: ClusterSummary[];
  relationshipData: { points: RelationshipPoint[] } | null;
}

export const ClusterIntelligencePage: React.FC<ClusterIntelligenceProps> = ({
  clusters,
  relationshipData
}) => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  if (!clusters || clusters.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No trained clusters available. Please run K-Means on the ML Clustering page.
      </div>
    );
  }

  const activeCluster = selectedCluster
    ? clusters.find((c) => c.cluster_name === selectedCluster) || clusters[0]
    : clusters[0];

  const points = relationshipData?.points || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cluster Intelligence & Profiling</h1>
        <p className="text-sm text-gray-500 mt-1">
          Detailed behavioral characteristics, summary statistics, and content patterns for each engagement tier.
        </p>
      </div>

      {/* Cluster Tab Selector */}
      <div className="flex gap-3 overflow-x-auto pb-1">
        {clusters.map((c) => {
          const isSelected = activeCluster.cluster_name === c.cluster_name;
          return (
            <button
              key={c.cluster_id}
              onClick={() => setSelectedCluster(c.cluster_name)}
              className={`px-4 py-3 rounded-xl border text-left transition flex-1 min-w-[200px] ${
                isSelected
                  ? 'bg-white border-[#FF0000] shadow-sm ring-1 ring-[#FF0000]'
                  : 'bg-white border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-xs text-gray-400 uppercase font-semibold">Cluster Tier</div>
              <div className="text-sm font-bold text-gray-900 mt-0.5">{c.cluster_name}</div>
              <div className="text-xs text-[#FF0000] font-mono mt-1">
                {c.share_of_total}% of videos ({c.video_count.toLocaleString()})
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Cluster Deep Profile */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Layers size={20} className="text-[#FF0000]" />
              {activeCluster.cluster_name} Behavioral Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1">{activeCluster.explanation}</p>
          </div>
          <span className="text-xs font-mono px-3 py-1 bg-red-50 text-[#FF0000] rounded-full border border-red-200 font-bold self-start sm:self-auto">
            {activeCluster.video_count.toLocaleString()} videos
          </span>
        </div>

        {/* 4 Key Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Average Views</span>
            <span className="text-lg font-bold text-gray-900 mt-1 block">
              {Math.round(activeCluster.avg_views).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400">Median: {Math.round(activeCluster.median_views).toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Average Likes</span>
            <span className="text-lg font-bold text-gray-900 mt-1 block">
              {Math.round(activeCluster.avg_likes).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400">Median: {Math.round(activeCluster.median_likes).toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[11px] text-gray-500 uppercase font-semibold block">Average Comments</span>
            <span className="text-lg font-bold text-gray-900 mt-1 block">
              {Math.round(activeCluster.avg_comments).toLocaleString()}
            </span>
            <span className="text-[10px] text-gray-400">Median: {Math.round(activeCluster.median_comments).toLocaleString()}</span>
          </div>

          <div className="p-4 rounded-lg bg-red-50/50 border border-red-100">
            <span className="text-[11px] text-red-700 uppercase font-semibold block">Engagement Rate</span>
            <span className="text-lg font-bold text-[#FF0000] mt-1 block">
              {activeCluster.avg_engagement_rate}%
            </span>
            <span className="text-[10px] text-red-500">Median: {activeCluster.median_engagement_rate}%</span>
          </div>
        </div>

        {/* Top Categories in this Cluster */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Dominant Categories in this Cluster</h3>
          <div className="flex flex-wrap gap-2">
            {activeCluster.top_categories.map((tc) => (
              <span
                key={tc.category}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-800 flex items-center gap-2 border border-gray-200"
              >
                <span>{tc.category}</span>
                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-gray-600">
                  {tc.count} videos
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster PCA 2D Dimensionality Reduction Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-900">2D PCA Cluster Separation Plot</h3>
          <span className="text-xs text-gray-500">Principal Component Analysis Projection</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Note: PCA reduces 4D engagement features (Views, Likes, Comments, Rate) to 2 components for visual verification.
        </p>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
              <XAxis type="number" dataKey="pca_x" name="PCA 1" tick={{ fontSize: 11, fill: '#606060' }} />
              <YAxis type="number" dataKey="pca_y" name="PCA 2" tick={{ fontSize: 11, fill: '#606060' }} />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ payload }) => {
                  if (!payload || !payload[0]) return null;
                  const data: RelationshipPoint = payload[0].payload;
                  return (
                    <div className="bg-white p-2.5 rounded border border-gray-200 shadow text-xs">
                      <div className="font-bold text-gray-900">{data.title}</div>
                      <div className="text-gray-500">{data.cluster} • Views: {data.views.toLocaleString()}</div>
                    </div>
                  );
                }}
              />
              <Scatter data={points} fill="#FF0000" fillOpacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
