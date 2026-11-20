import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  GitFork,
  Cpu,
  Layers,
  Lightbulb,
  Film,
  Upload,
  Globe2,
  Database,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react';
import { DatasetAuditInfo, CountryOption } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  auditInfo: DatasetAuditInfo | null;
  countries: CountryOption[];
  currentCountry: string;
  onCountryChange: (code: string) => void;
  onUploadSuccess: () => void;
}

export const DashboardLayout: React.FC<LayoutProps> = ({
  children,
  auditInfo,
  countries,
  currentCountry,
  onCountryChange,
  onUploadSuccess
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/dataset/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        alert('Dataset uploaded successfully!');
        onUploadSuccess();
      } else {
        const err = await res.json();
        alert(`Upload error: ${err.detail || 'Failed to process dataset'}`);
      }
    } catch (err) {
      alert('Upload failed. Please check network connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/categories', label: 'Category Analysis', icon: BarChart3 },
    { to: '/engagement', label: 'Engagement Relationships', icon: GitFork },
    { to: '/ml-clustering', label: 'ML Clustering (K-Means)', icon: Cpu },
    { to: '/cluster-intelligence', label: 'Cluster Intelligence', icon: Layers },
    { to: '/creator-takeaways', label: 'Creator Takeaways', icon: Lightbulb },
    { to: '/video-explorer', label: 'Video Explorer', icon: Film },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#0F0F0F]">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5E5E5] px-4 lg:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100 text-gray-700"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {/* Authentic YouTube Logo Icon */}
              <svg className="w-8 h-6 sm:w-9 sm:h-6" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M27.424 3.094A3.486 3.486 0 0 0 24.97.64C22.808.06 14 .06 14 .06s-8.808 0-10.97.58A3.486 3.486 0 0 0 .576 3.094C0 5.257 0 9.771 0 9.771s0 4.514.576 6.677a3.486 3.486 0 0 0 2.454 2.454c2.162.58 10.97.58 10.97.58s8.808 0 10.97-.58a3.486 3.486 0 0 0 2.454-2.454c.576-2.163.576-6.677.576-6.677s0-4.514-.576-6.677z"
                  fill="#FF0000"
                />
                <path d="m11.143 13.914 7.286-4.143-7.286-4.143v8.286z" fill="#FFFFFF" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-[#0F0F0F] flex items-center gap-2">
                YouTube Engagement Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Global Controls & Dataset Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Country Selector */}
          <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs sm:text-sm">
            <Globe2 size={15} className="text-gray-500" />
            <select
              value={currentCountry}
              onChange={(e) => onCountryChange(e.target.value)}
              className="bg-transparent font-medium text-gray-800 outline-none cursor-pointer pr-1"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code}) {c.available ? '' : '(Not Found)'}
                </option>
              ))}
            </select>
          </div>

          {/* Dataset Upload Trigger */}
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-xs font-semibold text-gray-700 transition">
            <Upload size={14} />
            <span className="hidden md:inline">{isUploading ? 'Uploading...' : 'Upload CSV'}</span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
            />
          </label>
        </div>
      </header>

      {/* Dataset Audit Banner */}
      {auditInfo && (
        <div className="bg-white border-b border-gray-200 px-4 lg:px-8 py-2 text-xs text-gray-600 flex flex-wrap items-center justify-between gap-y-1">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1 font-medium text-gray-800">
              <Database size={13} className="text-gray-500" />
              Source: <span className="text-[#0F0F0F] font-semibold">{auditInfo.filename}</span>
            </span>
            <span>Total Cleaned: <strong>{auditInfo.final_records.toLocaleString()}</strong> rows</span>
            <span>Unique Videos: <strong>{auditInfo.unique_videos.toLocaleString()}</strong></span>
            <span>Categories: <strong>{auditInfo.categories_count}</strong></span>
            {auditInfo.duplicates_removed > 0 && (
              <span className="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                Deduped {auditInfo.duplicates_removed.toLocaleString()} trending duplicates
              </span>
            )}
          </div>
        </div>
      )}

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-[#E5E5E5] flex flex-col transition-transform duration-200 ease-in-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 flex flex-col gap-1 flex-1 overflow-y-auto">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">
              Navigation
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-red-50 text-[#FF0000] font-semibold'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Footer badge */}
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-[11px] text-gray-500">
            <div className="flex items-center gap-1 font-semibold text-gray-700 mb-1">
              <CheckCircle2 size={13} className="text-emerald-600" /> Live Data Verified
            </div>
            Kaggle Historical Trending Dataset. Powered by Scikit-Learn K-Means.
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
