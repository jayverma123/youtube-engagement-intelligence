export interface DatasetAuditInfo {
  country: string;
  filename: string;
  original_records: number;
  duplicates_removed: number;
  invalid_records_removed: number;
  missing_values_handled: number;
  final_records: number;
  unique_videos: number;
  categories_count: number;
  date_range: { min: string; max: string };
}

export interface CountryOption {
  code: string;
  name: string;
  filename: string;
  available: boolean;
  record_count: number;
}

export interface KPIOverview {
  total_views: number;
  total_likes: number;
  total_comments: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  avg_engagement_rate: number;
  like_to_view_ratio: number;
  comment_to_view_ratio: number;
  unique_videos: number;
  total_records: number;
}

export interface CategoryMetric {
  category_id: number;
  category_name: string;
  video_count: number;
  total_views: number;
  total_likes: number;
  total_comments: number;
  avg_views: number;
  avg_likes: number;
  avg_comments: number;
  avg_engagement_rate: number;
  percentage_of_videos: number;
}

export interface RelationshipPoint {
  video_id: string;
  title: string;
  channel_title: string;
  category_name: string;
  views: number;
  likes: number;
  comments: number;
  engagement_rate: number;
  cluster: string;
  pca_x?: number;
  pca_y?: number;
}

export interface CorrelationMatrix {
  features: string[];
  matrix: number[][];
}

export interface ClusterSummary {
  cluster_id: number;
  cluster_name: string;
  video_count: number;
  share_of_total: number;
  avg_views: number;
  median_views: number;
  avg_likes: number;
  median_likes: number;
  avg_comments: number;
  median_comments: number;
  avg_engagement_rate: number;
  median_engagement_rate: number;
  top_categories: Array<{ category: string; count: number }>;
  explanation: string;
}

export interface MLEvaluation {
  k_range: number[];
  inertias: number[];
  silhouette_scores: number[];
  optimal_k: number;
  scaler_type: string;
  features_used: string[];
  silhouette_score_optimal: number;
}

export interface VideoRecord {
  video_id: string;
  title: string;
  channel_title: string;
  category_id: number;
  category_name: string;
  publish_time: string;
  trending_date: string;
  views: number;
  likes: number;
  dislikes: number;
  comment_count: number;
  thumbnail_link: string;
  engagement_rate: number;
  cluster: string;
  youtube_url: string;
}

export interface CreatorTakeaway {
  id: string;
  title: string;
  metric: string;
  insight: string;
  recommendation: string;
  category: string;
}
