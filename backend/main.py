import os
import logging
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from schemas.models import (
    DatasetInfo, CountryOption, KPIOverview, CategoryMetric,
    ClusterSummary, MLEvaluation, VideoPaginatedResponse, VideoRecord, CreatorTakeaway
)
from services.data_service import DataService
from services.analytics_service import AnalyticsService
from ml.clustering import MLService

# Logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("api")

app = FastAPI(
    title="YouTube Engagement Intelligence API",
    description="Machine Learning-Based Trending Video Analysis & Engagement Clustering Backend",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Services
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
data_service = DataService(base_dir=BASE_DIR)
ml_service = MLService()
analytics_service = AnalyticsService(data_service=data_service, ml_service=ml_service)

# Initial ML clustering run if data exists
if data_service.df_unique is not None and len(data_service.df_unique) > 0:
    try:
        logger.info("Performing initial ML clustering...")
        ml_service.fit_kmeans(data_service.df_unique, n_clusters=3)
    except Exception as e:
        logger.error(f"Failed initial clustering: {e}")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "YouTube Engagement Intelligence API",
        "current_country": data_service.current_country,
        "dataset_loaded": data_service.df_unique is not None and len(data_service.df_unique) > 0
    }

@app.get("/api/dataset/info")
def get_dataset_info():
    return data_service.audit_info

@app.get("/api/dataset/countries")
def get_countries():
    return data_service.list_available_countries()

@app.post("/api/dataset/select")
def select_country(country_code: str = Query(..., description="Country code e.g. IN, US, GB")):
    data_service.init_dataset(country_code.upper())
    if data_service.df_unique is not None and len(data_service.df_unique) > 0:
        ml_service.fit_kmeans(data_service.df_unique, n_clusters=3)
    return {
        "success": True,
        "country": data_service.current_country,
        "audit_info": data_service.audit_info
    }

@app.post("/api/dataset/upload")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV datasets are supported.")
    
    content = await file.read()
    success, msg = data_service.save_uploaded_csv(content, file.filename)
    if not success:
        raise HTTPException(status_code=500, detail=msg)
    
    # Train ML on newly uploaded data
    if data_service.df_unique is not None and len(data_service.df_unique) > 0:
        ml_service.fit_kmeans(data_service.df_unique, n_clusters=3)

    return {"success": True, "message": msg, "audit_info": data_service.audit_info}

@app.get("/api/analytics/overview")
def get_overview(level: str = Query("video", pattern="^(video|trending)$")):
    return analytics_service.get_overview_kpis(analysis_level=level)

@app.get("/api/analytics/categories")
def get_categories(level: str = Query("video", pattern="^(video|trending)$")):
    return analytics_service.get_category_metrics(analysis_level=level)

@app.get("/api/analytics/relationships")
def get_relationships(limit: int = Query(400, ge=50, le=1000)):
    return analytics_service.get_relationship_data(limit=limit)

@app.get("/api/analytics/trends")
def get_trends():
    return analytics_service.get_trends_data()

class TrainRequest(BaseModel):
    n_clusters: int = 3

@app.post("/api/ml/train")
def train_model(payload: TrainRequest):
    df = data_service.df_unique
    if df is None or len(df) == 0:
        raise HTTPException(status_code=400, detail="No active dataset available for training.")
    
    if payload.n_clusters < 2 or payload.n_clusters > 8:
        raise HTTPException(status_code=400, detail="n_clusters must be between 2 and 8.")

    _, summaries = ml_service.fit_kmeans(df, n_clusters=payload.n_clusters)
    return {
        "success": True,
        "n_clusters": payload.n_clusters,
        "summaries": summaries
    }

@app.get("/api/ml/evaluation")
def get_ml_evaluation():
    df = data_service.df_unique
    if df is None or len(df) == 0:
        return {
            "k_range": [],
            "inertias": [],
            "silhouette_scores": [],
            "optimal_k": 3,
            "scaler_type": "None",
            "features_used": [],
            "silhouette_score_optimal": 0.0
        }
    return ml_service.evaluate_clusters(df)

@app.get("/api/ml/clusters")
def get_clusters():
    return ml_service.cluster_summaries

@app.get("/api/videos", response_model=VideoPaginatedResponse)
def get_videos(
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=5, le=100),
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    cluster: Optional[str] = Query(None),
    sort_by: str = Query("views", pattern="^(views|likes|comment_count|engagement_rate)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$")
):
    df = analytics_service.get_active_df("video")
    if df is None or len(df) == 0:
        return {"total": 0, "page": page, "limit": limit, "pages": 0, "items": []}

    filtered = df.copy()

    # Search filter
    if search:
        s = search.lower()
        filtered = filtered[
            filtered['title'].str.lower().str.contains(s, na=False) |
            filtered['channel_title'].str.lower().str.contains(s, na=False)
        ]

    # Category filter
    if category and category.lower() != "all":
        filtered = filtered[filtered['category_name'].str.lower() == category.lower()]

    # Cluster filter
    if cluster and cluster.lower() != "all" and 'cluster' in filtered.columns:
        filtered = filtered[filtered['cluster'].str.lower() == cluster.lower()]

    # Sorting
    ascending = (sort_order == "asc")
    filtered = filtered.sort_values(by=sort_by, ascending=ascending)

    total_records = len(filtered)
    total_pages = (total_records + limit - 1) // limit if limit > 0 else 1

    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    page_df = filtered.iloc[start_idx:end_idx]

    items = []
    for _, row in page_df.iterrows():
        vid_id = str(row['video_id'])
        # Safe youtube link creation
        yt_link = f"https://www.youtube.com/watch?v={vid_id}" if vid_id and len(vid_id) >= 5 else "#"
        thumb = str(row.get('thumbnail_link', ''))
        if not thumb or thumb == 'nan':
            thumb = f"https://i.ytimg.com/vi/{vid_id}/hqdefault.jpg" if vid_id else ""

        items.append(VideoRecord(
            video_id=vid_id,
            title=str(row['title']),
            channel_title=str(row['channel_title']),
            category_id=int(row['category_id']),
            category_name=str(row['category_name']),
            publish_time=str(row['publish_time'])[:10],
            trending_date=str(row.get('trending_date', '')),
            views=int(row['views']),
            likes=int(row['likes']),
            dislikes=int(row.get('dislikes', 0)),
            comment_count=int(row['comment_count']),
            thumbnail_link=thumb,
            engagement_rate=float(row['engagement_rate']),
            cluster=str(row.get('cluster', 'Unassigned')),
            youtube_url=yt_link
        ))

    return {
        "total": total_records,
        "page": page,
        "limit": limit,
        "pages": total_pages,
        "items": items
    }

@app.get("/api/videos/{video_id}")
def get_video_detail(video_id: str):
    df = analytics_service.get_active_df("trending")
    if df is None:
        raise HTTPException(status_code=404, detail="Dataset not loaded")
    
    matches = df[df['video_id'] == video_id]
    if len(matches) == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    records = []
    for _, row in matches.iterrows():
        records.append({
            "trending_date": str(row.get('trending_date', '')),
            "views": int(row['views']),
            "likes": int(row['likes']),
            "comment_count": int(row['comment_count']),
            "engagement_rate": float(row['engagement_rate'])
        })

    first = matches.iloc[0]
    return {
        "video_id": video_id,
        "title": str(first['title']),
        "channel_title": str(first['channel_title']),
        "category_name": str(first['category_name']),
        "publish_time": str(first['publish_time']),
        "thumbnail_link": str(first.get('thumbnail_link', '')),
        "history_count": len(matches),
        "trending_history": records
    }

@app.get("/api/insights/creator-takeaways", response_model=List[CreatorTakeaway])
def get_creator_takeaways():
    return analytics_service.generate_creator_takeaways()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
