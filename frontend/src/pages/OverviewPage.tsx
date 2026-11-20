import React from 'react';
import { KPIOverview, CategoryMetric } from '../types';
import {
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Award,
  BarChart
} from 'lucide-react';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

interface OverviewPageProps {
  kpis: KPIOverview | null;
  categories: CategoryMetric[];
  trends: any[];
  analysisLevel: string;
  setAnalysisLevel: (level: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  kpis,
  categories,
  trends,
  analysisLevel,
  setAnalysisLevel
}) => {
  if (!kpis) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500 text-sm">Loading dataset analytics...</div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Views Recorded',
      value: kpis.total_views.toLocaleString(),
      sub: `Avg ${Math.round(kpis.avg_views).toLocaleString()} per item`,
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Total Likes Logged',
      value: kpis.total_likes.toLocaleString(),
      sub: `Avg ${Math.round(kpis.avg_likes).toLocaleString()} per item`,
      icon: ThumbsUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50'
    },
    {
      title: 'Total Comments',
      value: kpis.total_comments.toLocaleString(),
      sub: `Avg ${Math.round(kpis.avg_comments).toLocaleString()} per item`,
      icon: MessageSquare,
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      title: 'Avg Engagement Rate',
      value: `${kpis.avg_engagement_rate}%`,
      sub: `((Likes + Comments) ÷ Views) × 100`,
      icon: TrendingUp,
      color: 'text-[#FF0000]',
      bg: 'bg-red-50'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header and Level Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Historical YouTube trending-video analysis powered by machine learning clustering.
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center self-start sm:self-auto bg-gray-100 p-1 rounded-lg border border-gray-200 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setAnalysisLevel('video')}
            className={`px-3 py-1.5 rounded-md transition ${
              analysisLevel === 'video'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Video-Level (Deduplicated)
          </button>
          <button
            type="button"
            onClick={() => setAnalysisLevel('trending')}
            className={`px-3 py-1.5 rounded-md transition ${
              analysisLevel === 'trending'
                ? 'bg-white text-gray-900 shadow-sm border border-gray-200 font-bold'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Trending Observation Level
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg ${kpi.bg} ${kpi.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-xs text-gray-500 mt-1 font-medium">{kpi.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analytical Deep Dive: Ratios & Volume Distinction */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Award className="text-[#FF0000]" size={20} />
          <h2 className="text-base font-bold text-gray-900">Key Analytical Consideration: Rate vs Volume</h2>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          In online video engagement, high raw view counts often mask a lower proportional reaction rate.
          In this dataset, the aggregate Like-to-View ratio is <strong>{(kpis.like_to_view_ratio * 100).toFixed(2)}%</strong> and 
          Comment-to-View ratio is <strong>{(kpis.comment_to_view_ratio * 100).toFixed(2)}%</strong>.
          Videos with niche followings frequently generate higher engagement rates than mass-market viral hits despite having fewer views.
        </p>
      </div>

      {/* Two Column Section: Top Categories & Temporal Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Views & ER Breakdown */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Top Categories by Trending Volume</h3>
              <p className="text-xs text-gray-500">Distribution of videos across primary categories</p>
            </div>
            <BarChart size={18} className="text-gray-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsBarChart
                data={categories.slice(0, 7)}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis
                  dataKey="category_name"
                  tick={{ fontSize: 11, fill: '#606060' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#606060' }} />
                <Tooltip
                  formatter={(val: any) => [Number(val).toLocaleString(), 'Videos']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5' }}
                />
                <Bar dataKey="video_count" fill="#FF0000" radius={[4, 4, 0, 0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Temporal / Trend Chart */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-900">Publishing Timeline & Avg Engagement Rate</h3>
              <p className="text-xs text-gray-500">Monthly progression of audience engagement response</p>
            </div>
            <TrendingUp size={18} className="text-gray-400" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trends}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis
                  dataKey="period"
                  tick={{ fontSize: 11, fill: '#606060' }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#606060' }}
                  unit="%"
                />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Avg Engagement Rate']}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E5E5' }}
                />
                <Line
                  type="monotone"
                  dataKey="avg_engagement_rate"
                  stroke="#FF0000"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#FF0000' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
