const API_BASE = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = {
  getHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
  getDatasetInfo: async () => {
    const res = await fetch(`${API_BASE}/dataset/info`);
    return res.json();
  },
  getCountries: async () => {
    const res = await fetch(`${API_BASE}/dataset/countries`);
    return res.json();
  },
  selectCountry: async (countryCode: string) => {
    const res = await fetch(`${API_BASE}/dataset/select?country_code=${countryCode}`, {
      method: 'POST'
    });
    return res.json();
  },
  uploadDataset: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE}/dataset/upload`, {
      method: 'POST',
      body: formData
    });
    return res.json();
  },
  getOverview: async (level: string = 'video') => {
    const res = await fetch(`${API_BASE}/analytics/overview?level=${level}`);
    return res.json();
  },
  getCategories: async (level: string = 'video') => {
    const res = await fetch(`${API_BASE}/analytics/categories?level=${level}`);
    return res.json();
  },
  getRelationships: async (limit: number = 400) => {
    const res = await fetch(`${API_BASE}/analytics/relationships?limit=${limit}`);
    return res.json();
  },
  getTrends: async () => {
    const res = await fetch(`${API_BASE}/analytics/trends`);
    return res.json();
  },
  getEvaluation: async () => {
    const res = await fetch(`${API_BASE}/ml/evaluation`);
    return res.json();
  },
  getClusters: async () => {
    const res = await fetch(`${API_BASE}/ml/clusters`);
    return res.json();
  },
  trainML: async (nClusters: number) => {
    const res = await fetch(`${API_BASE}/ml/train`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n_clusters: nClusters })
    });
    return res.json();
  },
  getVideos: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    cluster?: string;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.set('page', params.page.toString());
    if (params.limit) searchParams.set('limit', params.limit.toString());
    if (params.search) searchParams.set('search', params.search);
    if (params.category) searchParams.set('category', params.category);
    if (params.cluster) searchParams.set('cluster', params.cluster);
    if (params.sort_by) searchParams.set('sort_by', params.sort_by);
    if (params.sort_order) searchParams.set('sort_order', params.sort_order);

    const res = await fetch(`${API_BASE}/videos?${searchParams.toString()}`);
    return res.json();
  },
  getCreatorTakeaways: async () => {
    const res = await fetch(`${API_BASE}/insights/creator-takeaways`);
    return res.json();
  }
};
