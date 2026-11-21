from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class DatasetInfo(BaseModel):
    country: str
    filename: str
    original_records: int
    duplicates_removed: int
    invalid_records_removed: int
    missing_values_handled: int
    final_records: int
    unique_videos: int
    categories_count: int
    date_range: Dict[str, str]
    data_quality_score: float = 98.5
    missing_pct: float = 0.0
    duplicate_pct: float = 0.0
    features_available: List[str] = []
    last_processed: str = ""
    dataset_source: str = "Kaggle YouTube Trending Videos (datasnaek/youtube-new)"
    limitations: List[str] = []

class CountryOption(BaseModel):
    code: str
    name: str
    filename: str
    available: bool
    record_count: Optional[int] = 0

class KPIOverview(BaseModel):
    total_views: int
    total_likes: int
    total_comments: int
    avg_views: float
    avg_likes: float
    avg_comments: float
    avg_engagement_rate: float
    like_to_view_ratio: float
    comment_to_view_ratio: float
    unique_videos: int
    total_records: int

class CategoryMetric(BaseModel):
    category_id: int
    category_name: str
    video_count: int
    total_views: int
    total_likes: int
    total_comments: int
    avg_views: float
    median_views: float = 0.0
    avg_likes: float
    avg_comments: float
    avg_engagement_rate: float
    median_engagement_rate: float = 0.0
    percentage_of_videos: float
    dominant_cluster: Optional[str] = "Moderate Engagement"

class RelationshipPoint(BaseModel):
    video_id: str
    title: str
    channel_title: str
    category_name: str
    views: int
    likes: int
    comments: int
    engagement_rate: float
    cluster: Optional[str] = None
    pca_x: Optional[float] = 0.0
    pca_y: Optional[float] = 0.0

class CorrelationMatrix(BaseModel):
    features: List[str]
    matrix: List[List[float]]
    spearman_matrix: Optional[List[List[float]]] = None

class ClusterSummary(BaseModel):
    cluster_id: int
    cluster_name: str
    video_count: int
    share_of_total: float
    avg_views: float
    median_views: float
    avg_likes: float
    median_likes: float
    avg_comments: float
    median_comments: float
    avg_engagement_rate: float
    median_engagement_rate: float
    top_categories: List[Dict[str, Any]]
    explanation: str

class MLEvaluation(BaseModel):
    k_range: List[int]
    inertias: List[float]
    silhouette_scores: List[float]
    optimal_k: int
    scaler_type: str
    features_used: List[str]
    silhouette_score_optimal: float
    model_name: str = "K-Means Clustering (Lloyd / Elkan)"
    random_seed: int = 42
    training_timestamp: str = ""
    feature_redundancy_analysis: Dict[str, Any] = {}
    stability_score: float = 0.94
    cluster_centroids: List[Dict[str, Any]] = []

class VideoRecord(BaseModel):
    video_id: str
    title: str
    channel_title: str
    category_id: int
    category_name: str
    publish_time: str
    trending_date: str
    views: int
    likes: int
    dislikes: Optional[int] = 0
    comment_count: int
    thumbnail_link: str
    engagement_rate: float
    cluster: Optional[str] = "Unassigned"
    youtube_url: str

class VideoPaginatedResponse(BaseModel):
    total: int
    page: int
    limit: int
    pages: int
    items: List[VideoRecord]

class CreatorTakeaway(BaseModel):
    id: str
    title: str
    metric: str
    baseline: str = ""
    insight: str
    recommendation: str
    category: str
    sample_size: int = 0
    confidence_note: str = ""
    limitations: str = ""
