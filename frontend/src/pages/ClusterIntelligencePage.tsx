import React, { useState } from 'react';
import { ClusterSummary, RelationshipPoint } from '../types';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { Layers, ArrowUpDown, SlidersHorizontal } from 'lucide-react';

interface ClusterIntelligenceProps {
  clusters: ClusterSummary[];
  relationshipData: { points: RelationshipPoint[] } | null;
}

export const ClusterIntelligencePage: React.FC<ClusterIntelligenceProps> = ({
  clusters,
  relationshipData
}) => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [compareClusterA, setCompareClusterA] = useState<string>(clusters[0]?.cluster_name || '');
  const [compareClusterB, setCompareClusterB] = useState<string>(clusters[1]?.cluster_name || clusters[0]?.cluster_name || '');

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

  const clusterA = clusters.find((c) => c.cluster_name === compareClusterA) || clusters[0];
  const clusterB = clusters.find((c) => c.cluster_name === compareClusterB) || clusters[1] || clusters[0];

  const comparisonData = [
    {
      metric: 'Engagement Rate (%)',
      [clusterA.cluster_name]: clusterA.avg_engagement_rate,
      [clusterB.cluster_name]: clusterB.avg_engagement_rate
    },
    {
      metric: 'Views (x100k)',
      [clusterA.cluster_name]: Number((clusterA.avg_views / 100000).toFixed(1)),
      [clusterB.cluster_name]: Number((clusterB.avg_views / 100000).toFixed(1))
    },
    {
      metric: 'Likes (x10k)',
      [clusterA.cluster_name]: Number((clusterA.avg_likes / 10000).toFixed(1)),
      [clusterB.cluster_name]: Number((clusterB.avg_likes / 10000).toFixed(1))
    },
    {
      metric: 'Comments (x1k)',
      [clusterA.cluster_name]: Number((clusterA.avg_comments / 1000).toFixed(1)),
      [clusterB.cluster_name]: Number((clusterB.avg_comments / 1000).toFixed(1))
    }
  ];

  const points = relationshipData?.points || [];

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cluster Intelligence & Profiling</h1>
        <p className="text-sm text-gray-500 mt-1">
          Detailed behavioral characteristics, summary statistics, cluster comparisons, and 2D spatial separation.
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
              <div className="text-xs text-[#FF0000] mt-1 font-semibold">
                {c.share_of_total}% of videos ({c.video_count.toLocaleString()})
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Cluster Profile */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Layers size={20} className="text-[#FF0000]" />
              {activeCluster.cluster_name} Behavioral Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1">{activeCluster.explanation}</p>
          </div>
          <span className="text-xs px-3 py-1 bg-red-50 text-[#FF0000] rounded-full border border-red-200 font-bold self-start sm:self-auto">
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

        {/* Top Categories */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Dominant Categories in this Cluster</h3>
          <div className="flex flex-wrap gap-2">
            {activeCluster.top_categories.map((tc) => (
              <span
                key={tc.category}
                className="px-3 py-1.5 rounded-lg bg-gray-100 text-xs font-medium text-gray-800 flex items-center gap-2 border border-gray-200"
              >
                <span>{tc.category}</span>
                <span className="bg-white px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-600">
                  {tc.count} videos
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Cluster Comparison Tool */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-[#FF0000]" />
            <h3 className="text-base font-bold text-gray-900">Interactive Cluster Comparison Tool</h3>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <select
              value={compareClusterA}
              onChange={(e) => setCompareClusterA(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded p-1.5 font-medium"
            >
              {clusters.map((c) => (
                <option key={c.cluster_id} value={c.cluster_name}>{c.cluster_name}</option>
              ))}
            </select>
            <span className="text-gray-400 font-bold">vs</span>
            <select
              value={compareClusterB}
              onChange={(e) => setCompareClusterB(e.target.value)}
              className="bg-gray-50 border border-gray-300 rounded p-1.5 font-medium"
            >
              {clusters.map((c) => (
                <option key={c.cluster_id} value={c.cluster_name}>{c.cluster_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis dataKey="metric" tick={{ fontSize: 11, fill: '#606060' }} />
              <YAxis tick={{ fontSize: 11, fill: '#606060' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5' }} />
              <Legend />
              <Bar dataKey={clusterA.cluster_name} fill="#0F0F0F" radius={[4, 4, 0, 0]} />
              <Bar dataKey={clusterB.cluster_name} fill="#FF0000" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cluster PCA 2D Dimensionality Reduction Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold text-gray-900">2D PCA Spatial Separation Plot</h3>
          <span className="text-xs text-gray-500">Principal Component Analysis Projection</span>
        </div>
        <p className="text-xs text-gray-500 mb-4">
          Note: PCA reduces 4D engagement features (Views, Likes, Comments, Rate) to 2 orthogonal components for visual separation inspection.
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
