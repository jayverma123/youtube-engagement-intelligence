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
    avg_likes: float
    avg_comments: float
    avg_engagement_rate: float
    percentage_of_videos: float

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

class CorrelationMatrix(BaseModel):
    features: List[str]
    matrix: List[List[float]]

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
    insight: str
    recommendation: str
    category: str
