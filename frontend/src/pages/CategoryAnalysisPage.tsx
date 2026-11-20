import React, { useState } from 'react';
import { CategoryMetric } from '../types';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import { BarChart3, Filter } from 'lucide-react';

interface CategoryAnalysisProps {
  categories: CategoryMetric[];
}

export const CategoryAnalysisPage: React.FC<CategoryAnalysisProps> = ({ categories }) => {
  const [metricKey, setMetricKey] = useState<'avg_views' | 'avg_likes' | 'avg_comments' | 'avg_engagement_rate'>('avg_engagement_rate');

  const metricLabels = {
    avg_engagement_rate: 'Average Engagement Rate (%)',
    avg_views: 'Average Views per Video',
    avg_likes: 'Average Likes per Video',
    avg_comments: 'Average Comments per Video'
  };

  const sortedCategories = [...categories].sort((a, b) => (b[metricKey] as number) - (a[metricKey] as number));

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Category-Wise Engagement Analysis</h1>
          <p className="text-sm text-gray-500 mt-1">
            Explore and contrast engagement metrics, view averages, and audience response across all YouTube categories.
          </p>
        </div>

        {/* Metric Switcher */}
        <div className="flex items-center gap-2">
          <Filter size={15} className="text-gray-500" />
          <select
            value={metricKey}
            onChange={(e: any) => setMetricKey(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-sm font-semibold text-gray-800 rounded-lg p-2 outline-none cursor-pointer"
          >
            <option value="avg_engagement_rate">Engagement Rate (%)</option>
            <option value="avg_views">Average Views</option>
            <option value="avg_likes">Average Likes</option>
            <option value="avg_comments">Average Comments</option>
          </select>
        </div>
      </div>

      {/* Main Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#FF0000]" />
          Ranking by {metricLabels[metricKey]}
        </h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={sortedCategories}
              margin={{ top: 10, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
              <XAxis
                dataKey="category_name"
                tick={{ fontSize: 11, fill: '#606060' }}
                angle={-30}
                textAnchor="end"
              />
              <YAxis tick={{ fontSize: 11, fill: '#606060' }} />
              <Tooltip
                formatter={(val: any) => [
                  metricKey === 'avg_engagement_rate' ? `${val}%` : Number(val).toLocaleString(),
                  metricLabels[metricKey]
                ]}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5' }}
              />
              <Bar dataKey={metricKey} fill="#FF0000" radius={[4, 4, 0, 0]} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Category Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 font-bold text-gray-900 text-base">
          All Categories Detailed Breakdown
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3">Category Name</th>
                <th className="px-4 py-3 text-right">Video Count</th>
                <th className="px-4 py-3 text-right">Total Views</th>
                <th className="px-4 py-3 text-right">Avg Views</th>
                <th className="px-4 py-3 text-right">Avg Likes</th>
                <th className="px-4 py-3 text-right">Avg Comments</th>
                <th className="px-4 py-3 text-right text-gray-900">Avg Engagement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {sortedCategories.map((c) => (
                <tr key={c.category_id} className="hover:bg-gray-50 transition">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.category_name}</td>
                  <td className="px-4 py-3 text-right">{c.video_count.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{c.total_views.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{Math.round(c.avg_views).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{Math.round(c.avg_likes).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{Math.round(c.avg_comments).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#FF0000]">
                    {c.avg_engagement_rate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
