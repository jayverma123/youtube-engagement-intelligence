import React, { useState } from 'react';
import { MLEvaluation, ClusterSummary } from '../types';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { Cpu, Play, AlertCircle, Sparkles } from 'lucide-react';

interface MLClusteringProps {
  evaluation: MLEvaluation | null;
  clusters: ClusterSummary[];
  onTrain: (n: number) => void;
  isTraining: boolean;
}

export const MLClusteringPage: React.FC<MLClusteringProps> = ({
  evaluation,
  clusters,
  onTrain,
  isTraining
}) => {
  const [selectedK, setSelectedK] = useState(3);

  if (!evaluation) {
    return <div className="p-8 text-center text-gray-500">Loading ML evaluation...</div>;
  }

  // Format evaluation points for charts
  const evalData = evaluation.k_range.map((k, idx) => ({
    k,
    inertia: evaluation.inertias[idx],
    silhouette: evaluation.silhouette_scores[idx]
  }));

  return (
    <div className="space-y-6">
      {/* Header and Retrain Controls */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Machine Learning: K-Means Clustering</h1>
          <p className="text-sm text-gray-500 mt-1">
            Unsupervised clustering pipeline using Log1p transformation, RobustScaler, and Scikit-Learn K-Means.
          </p>
        </div>

        {/* Retrain Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="text-gray-500">Clusters (k):</span>
            <select
              value={selectedK}
              onChange={(e) => setSelectedK(Number(e.target.value))}
              disabled={isTraining}
              className="bg-gray-50 border border-gray-300 rounded-lg p-2 text-gray-800 outline-none cursor-pointer"
            >
              <option value={2}>2 Clusters</option>
              <option value={3}>3 Clusters (Recommended)</option>
              <option value={4}>4 Clusters</option>
              <option value={5}>5 Clusters</option>
            </select>
          </div>

          <button
            onClick={() => onTrain(selectedK)}
            disabled={isTraining}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FF0000] text-white rounded-lg text-xs font-bold hover:bg-[#CC0000] transition disabled:opacity-50"
          >
            {isTraining ? <AlertCircle size={15} className="animate-spin" /> : <Play size={15} />}
            <span>{isTraining ? 'Training Model...' : 'Train K-Means'}</span>
          </button>
        </div>
      </div>

      {/* Preprocessing Pipeline Card */}
      <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap items-center justify-between gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <Cpu className="text-[#FF0000]" size={18} />
          <span className="font-bold text-gray-900">Feature Engineering & Preprocessing Pipeline:</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap text-gray-700">
          <span className="bg-gray-100 px-2.5 py-1 rounded font-medium">Views, Likes, Comments, Engagement Rate</span>
          <span className="text-gray-400 font-bold">→</span>
          <span className="bg-gray-100 px-2.5 py-1 rounded font-medium">Log1p Transformation</span>
          <span className="text-gray-400 font-bold">→</span>
          <span className="bg-gray-100 px-2.5 py-1 rounded font-medium">RobustScaler</span>
          <span className="text-gray-400 font-bold">→</span>
          <span className="bg-red-50 text-red-700 font-semibold px-2.5 py-1 rounded border border-red-200">
            K-Means (k={clusters.length || 3})
          </span>
        </div>
      </div>

      {/* Elbow Method & Silhouette Score Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Elbow Curve */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">Elbow Method (Inertia WCSS)</h3>
            <span className="text-xs text-gray-400 font-mono">Within-Cluster Sum of Squares</span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Measures cluster compactness. The 'elbow' bend indicates the point of diminishing returns.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evalData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#606060' }} label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11, fill: '#606060' }} />
                <Tooltip formatter={(val: any) => [Number(val).toFixed(0), 'Inertia']} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5' }} />
                <Line type="monotone" dataKey="inertia" stroke="#0F0F0F" strokeWidth={2} dot={{ r: 4, fill: '#0F0F0F' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Silhouette Score */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-gray-900">Silhouette Coefficient</h3>
            <span className="text-xs text-emerald-600 font-bold font-mono">
              Optimal k: {evaluation.optimal_k} (Score: {evaluation.silhouette_score_optimal.toFixed(3)})
            </span>
          </div>
          <p className="text-xs text-gray-500 mb-4">
            Evaluates cluster separation quality (-1 to +1). Higher positive values indicate well-separated clusters.
          </p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evalData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis dataKey="k" tick={{ fontSize: 11, fill: '#606060' }} label={{ value: 'Number of Clusters (k)', position: 'insideBottom', offset: -10, fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11, fill: '#606060' }} />
                <Tooltip formatter={(val: any) => [val, 'Silhouette Score']} contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5' }} />
                <Bar dataKey="silhouette" fill="#FF0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Cluster Distribution Overview */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[#FF0000]" />
          Trained Cluster Distribution & Interpretation
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clusters.map((c) => (
            <div key={c.cluster_id} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-gray-900">{c.cluster_name}</span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-red-100 text-[#FF0000]">
                  {c.share_of_total}%
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {c.explanation}
              </p>
              <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Avg Views</span>
                  <span className="font-semibold text-gray-800">{Math.round(c.avg_views).toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase">Avg Rate</span>
                  <span className="font-semibold text-[#FF0000]">{c.avg_engagement_rate}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
