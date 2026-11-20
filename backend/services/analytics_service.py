from typing import List, Dict, Any, Optional
import pandas as pd
import numpy as np

class AnalyticsService:
    def __init__(self, data_service, ml_service):
        self.data_service = data_service
        self.ml_service = ml_service

    def get_active_df(self, analysis_level: str = "video") -> Optional[pd.DataFrame]:
        """Returns either video-level (deduplicated) or trending-record-level DataFrame."""
        if analysis_level == "trending":
            return self.data_service.df_trending
        # Default to video level (deduplicated)
        if self.ml_service.df_with_clusters is not None:
            return self.ml_service.df_with_clusters
        return self.data_service.df_unique

    def get_overview_kpis(self, analysis_level: str = "video") -> Dict[str, Any]:
        df = self.get_active_df(analysis_level)
        if df is None or len(df) == 0:
            return {
                "total_views": 0,
                "total_likes": 0,
                "total_comments": 0,
                "avg_views": 0.0,
                "avg_likes": 0.0,
                "avg_comments": 0.0,
                "avg_engagement_rate": 0.0,
                "like_to_view_ratio": 0.0,
                "comment_to_view_ratio": 0.0,
                "unique_videos": 0,
                "total_records": 0
            }

        total_views = int(df['views'].sum())
        total_likes = int(df['likes'].sum())
        total_comments = int(df['comment_count'].sum())
        
        avg_views = float(df['views'].mean())
        avg_likes = float(df['likes'].mean())
        avg_comments = float(df['comment_count'].mean())
        avg_engagement_rate = float(df['engagement_rate'].mean())
        
        safe_views = max(total_views, 1)
        like_ratio = round(total_likes / safe_views, 4)
        comment_ratio = round(total_comments / safe_views, 4)

        return {
            "total_views": total_views,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "avg_views": round(avg_views, 1),
            "avg_likes": round(avg_likes, 1),
            "avg_comments": round(avg_comments, 1),
            "avg_engagement_rate": round(avg_engagement_rate, 2),
            "like_to_view_ratio": like_ratio,
            "comment_to_view_ratio": comment_ratio,
            "unique_videos": int(self.data_service.df_unique['video_id'].nunique()) if self.data_service.df_unique is not None else 0,
            "total_records": len(df)
        }

    def get_category_metrics(self, analysis_level: str = "video") -> List[Dict[str, Any]]:
        df = self.get_active_df(analysis_level)
        if df is None or len(df) == 0:
            return []

        grouped = df.groupby(['category_id', 'category_name']).agg(
            video_count=('video_id', 'count'),
            total_views=('views', 'sum'),
            total_likes=('likes', 'sum'),
            total_comments=('comment_count', 'sum'),
            avg_views=('views', 'mean'),
            avg_likes=('likes', 'mean'),
            avg_comments=('comment_count', 'mean'),
            avg_engagement_rate=('engagement_rate', 'mean')
        ).reset_index()

        total_vids = len(df)
        results = []
        for _, row in grouped.iterrows():
            results.append({
                "category_id": int(row['category_id']),
                "category_name": str(row['category_name']),
                "video_count": int(row['video_count']),
                "total_views": int(row['total_views']),
                "total_likes": int(row['total_likes']),
                "total_comments": int(row['total_comments']),
                "avg_views": round(float(row['avg_views']), 1),
                "avg_likes": round(float(row['avg_likes']), 1),
                "avg_comments": round(float(row['avg_comments']), 1),
                "avg_engagement_rate": round(float(row['avg_engagement_rate']), 2),
                "percentage_of_videos": round((row['video_count'] / total_vids) * 100, 2)
            })

        # Sort by video count descending
        results.sort(key=lambda x: x['video_count'], reverse=True)
        return results

    def get_relationship_data(self, limit: int = 400) -> Dict[str, Any]:
        """Provides sample points for scatter plots and Pearson correlation matrix."""
        df = self.get_active_df("video")
        if df is None or len(df) == 0:
            return {"points": [], "correlation": {"features": [], "matrix": []}}

        # Correlation Matrix on features
        cols = ['views', 'likes', 'comment_count', 'engagement_rate']
        corr = df[cols].corr().round(3)
        corr_matrix = {
            "features": cols,
            "matrix": corr.values.tolist()
        }

        # Subsample for responsive UI rendering
        sample_df = df.sample(min(limit, len(df)), random_state=42) if len(df) > limit else df
        
        points = []
        has_cluster = 'cluster' in sample_df.columns
        has_pca = 'pca_x' in sample_df.columns

        for _, row in sample_df.iterrows():
            points.append({
                "video_id": str(row['video_id']),
                "title": str(row['title'])[:60],
                "channel_title": str(row['channel_title']),
                "category_name": str(row['category_name']),
                "views": int(row['views']),
                "likes": int(row['likes']),
                "comments": int(row['comment_count']),
                "engagement_rate": float(row['engagement_rate']),
                "cluster": str(row['cluster']) if has_cluster else "Unassigned",
                "pca_x": float(row['pca_x']) if has_pca else 0.0,
                "pca_y": float(row['pca_y']) if has_pca else 0.0
            })

        return {
            "points": points,
            "correlation": corr_matrix
        }

    def get_trends_data(self) -> List[Dict[str, Any]]:
        """Publishing monthly/quarterly patterns and average views/engagement."""
        df = self.get_active_df("video")
        if df is None or len(df) == 0:
            return []

        df_time = df.dropna(subset=['publish_time']).copy()
        if len(df_time) == 0:
            return []

        # Group by Period (Month-Year)
        df_time['period'] = df_time['publish_time'].dt.to_period('M').astype(str)
        trend = df_time.groupby('period').agg(
            video_count=('video_id', 'count'),
            avg_views=('views', 'mean'),
            avg_likes=('likes', 'mean'),
            avg_engagement_rate=('engagement_rate', 'mean')
        ).reset_index()

        trend = trend.sort_values(by='period').tail(15)  # Keep recent 15 months
        results = []
        for _, row in trend.iterrows():
            results.append({
                "period": str(row['period']),
                "video_count": int(row['video_count']),
                "avg_views": round(float(row['avg_views']), 0),
                "avg_likes": round(float(row['avg_likes']), 0),
                "avg_engagement_rate": round(float(row['avg_engagement_rate']), 2)
            })
        return results

    def generate_creator_takeaways(self) -> List[Dict[str, Any]]:
        """Extracts dynamic, data-driven takeaways based on actual calculations."""
        df = self.get_active_df("video")
        if df is None or len(df) == 0:
            return []

        cat_metrics = self.get_category_metrics("video")
        if not cat_metrics:
            return []

        # 1. Top category by engagement rate (min 5 videos)
        meaningful_cats = [c for c in cat_metrics if c['video_count'] >= 5]
        if not meaningful_cats:
            meaningful_cats = cat_metrics

        highest_er_cat = max(meaningful_cats, key=lambda c: c['avg_engagement_rate'])
        highest_view_cat = max(meaningful_cats, key=lambda c: c['avg_views'])
        
        # 2. Volume vs Rate divergence
        corr_data = self.get_relationship_data(limit=10)
        corr_matrix = corr_data["correlation"]
        # Find view vs engagement_rate correlation
        v_idx = corr_matrix["features"].index("views")
        er_idx = corr_matrix["features"].index("engagement_rate")
        view_er_corr = corr_matrix["matrix"][v_idx][er_idx]

        # 3. Cluster characteristic takeaway
        cluster_summaries = self.ml_service.cluster_summaries
        higher_cluster = next((c for c in cluster_summaries if "Higher" in c["cluster_name"]), None)

        takeaways = [
            {
                "id": "t1",
                "title": "Highest Engagement Category",
                "metric": f"{highest_er_cat['avg_engagement_rate']}% avg engagement rate",
                "insight": f"'{highest_er_cat['category_name']}' generates the highest audience response rate relative to its viewership, with {highest_er_cat['video_count']} trending videos observed.",
                "recommendation": "Content creators in this niche enjoy a receptive, participatory audience that actively likes and comments.",
                "category": highest_er_cat['category_name']
            },
            {
                "id": "t2",
                "title": "Scale vs Engagement Rate Dynamics",
                "metric": f"Correlation: {view_er_corr}",
                "insight": (
                    f"Mass-market categories like '{highest_view_cat['category_name']}' achieve massive view counts (avg {int(highest_view_cat['avg_views']):,}), "
                    f"yet the views-to-engagement rate correlation is {view_er_corr}. Higher views do not automatically guarantee a higher proportional reaction."
                ),
                "recommendation": "Do not treat raw views as the sole metric of connection. High-retention communities often demonstrate superior engagement rates on modest view volumes.",
                "category": highest_view_cat['category_name']
            }
        ]

        if higher_cluster:
            takeaways.append({
                "id": "t3",
                "title": "Characteristics of Top-Tier Engagement",
                "metric": f"{higher_cluster['share_of_total']}% of analyzed videos",
                "insight": (
                    f"The machine-learning clustering grouped {higher_cluster['video_count']} videos into '{higher_cluster['cluster_name']}', "
                    f"averaging {int(higher_cluster['avg_views']):,} views and {higher_cluster['avg_engagement_rate']}% engagement rate."
                ),
                "recommendation": "Notice the balanced ratio of likes to comments in this tier. Encourage direct discussion prompts in video intros to unlock community commenting.",
                "category": "Cross-Category ML Insight"
            })

        return takeaways
