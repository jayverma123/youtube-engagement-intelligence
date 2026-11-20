import React, { useState, useEffect } from 'react';
import { VideoRecord, CategoryMetric, ClusterSummary } from '../types';
import { api } from '../services/api';
import {
  Search,
  Filter,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  ThumbsUp,
  MessageSquare,
  TrendingUp,
  Film
} from 'lucide-react';

interface VideoExplorerProps {
  categories: CategoryMetric[];
  clusters: ClusterSummary[];
}

export const VideoExplorerPage: React.FC<VideoExplorerProps> = ({ categories, clusters }) => {
  const [videos, setVideos] = useState<VideoRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [sortBy, setSortBy] = useState('views');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await api.getVideos({
        page,
        limit,
        search: search.trim() || undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        cluster: selectedCluster !== 'All' ? selectedCluster : undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setVideos(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.pages || 1);
    } catch (e) {
      console.error('Error fetching videos:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [page, selectedCategory, selectedCluster, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchVideos();
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Video Record Explorer</h1>
        <p className="text-sm text-gray-500 mt-1">
          Search, filter, and inspect individual trending records, engagement rates, and assigned ML clusters.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative flex items-center">
            <Search size={16} className="absolute left-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by video title or channel name..."
              className="w-full pl-9 pr-20 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm outline-none focus:border-[#FF0000]"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs font-semibold text-gray-700"
            >
              Search
            </button>
          </form>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold uppercase">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 font-medium text-gray-800 outline-none"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_name}>
                  {c.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* Cluster Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-400 font-semibold uppercase">Cluster:</span>
            <select
              value={selectedCluster}
              onChange={(e) => {
                setSelectedCluster(e.target.value);
                setPage(1);
              }}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg p-2 font-medium text-gray-800 outline-none"
            >
              <option value="All">All Clusters</option>
              {clusters.map((c) => (
                <option key={c.cluster_id} value={c.cluster_name}>
                  {c.cluster_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sorting options */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs text-gray-600 flex-wrap gap-2">
          <span>Found <strong>{total.toLocaleString()}</strong> matching records</span>
          <div className="flex items-center gap-3">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer"
            >
              <option value="views">Views</option>
              <option value="likes">Likes</option>
              <option value="comment_count">Comments</option>
              <option value="engagement_rate">Engagement Rate</option>
            </select>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Videos List / Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 text-sm">Loading video records...</div>
        ) : videos.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No videos match the criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-700">
              <thead className="bg-gray-50 text-[11px] uppercase font-semibold text-gray-400 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Video Title & Channel</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Views</th>
                  <th className="px-4 py-3 text-right">Likes</th>
                  <th className="px-4 py-3 text-right">Comments</th>
                  <th className="px-4 py-3 text-right text-gray-900">Engagement Rate</th>
                  <th className="px-4 py-3 text-center">Cluster</th>
                  <th className="px-4 py-3 text-center">Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {videos.map((vid) => (
                  <tr key={vid.video_id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-semibold text-gray-900 line-clamp-1">{vid.title}</div>
                      <div className="text-gray-500 text-[11px]">{vid.channel_title} • {vid.publish_time}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{vid.category_name}</td>
                    <td className="px-4 py-3 text-right">{vid.views.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{vid.likes.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{vid.comment_count.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-bold text-[#FF0000]">
                      {vid.engagement_rate}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {vid.cluster}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <a
                        href={vid.youtube_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-gray-400 hover:text-red-600 inline-block p-1"
                        title="Open on YouTube"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        <div className="p-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div>Page {page} of {totalPages}</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
