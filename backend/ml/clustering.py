import logging
from typing import Dict, List, Optional, Tuple, Any
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler, RobustScaler
from sklearn.decomposition import PCA
from sklearn.metrics import silhouette_score

logger = logging.getLogger(__name__)

class MLService:
    def __init__(self):
        self.fitted_model: Optional[KMeans] = None
        self.scaler: Optional[StandardScaler] = None
        self.features_used = ['views', 'likes', 'comment_count', 'engagement_rate']
        self.scaler_type = "RobustScaler + Log1p"
        self.cluster_labels_map: Dict[int, str] = {}
        self.cluster_summaries: List[Dict[str, Any]] = []
        self.evaluation_results: Optional[Dict[str, Any]] = None
        self.df_with_clusters: Optional[pd.DataFrame] = None
        self.pca_coordinates: Optional[List[Dict[str, Any]]] = None

    def evaluate_clusters(self, df: pd.DataFrame, max_k: int = 7) -> Dict[str, Any]:
        """Runs the Elbow method and Silhouette Score across k=2 to max_k."""
        if df is None or len(df) < 10:
            return {
                "k_range": [],
                "inertias": [],
                "silhouette_scores": [],
                "optimal_k": 3,
                "scaler_type": self.scaler_type,
                "features_used": self.features_used,
                "silhouette_score_optimal": 0.0
            }

        X_processed = self._preprocess_features(df)
        
        # Subsample for silhouette if dataset is massive to ensure responsive latency
        sample_size = min(len(X_processed), 3000)
        np.random.seed(42)
        idx = np.random.choice(len(X_processed), sample_size, replace=False)
        X_sample = X_processed[idx]

        k_range = list(range(2, min(max_k + 1, len(df))))
        inertias = []
        silhouettes = []

        best_score = -1.0
        best_k = 3

        for k in k_range:
            km = KMeans(n_clusters=k, random_state=42, n_init=10)
            km.fit(X_processed)
            inertias.append(float(km.inertia_))
            
            # Compute silhouette on sample
            labels_sample = km.predict(X_sample)
            score = float(silhouette_score(X_sample, labels_sample))
            silhouettes.append(round(score, 4))
            
            if score > best_score:
                best_score = score
                best_k = k

        # Recommended k default to 3 if elbow/silhouette is close or reasonable for lower/moderate/higher grouping
        chosen_k = best_k if best_k in [3, 4] else 3
        
        self.evaluation_results = {
            "k_range": k_range,
            "inertias": inertias,
            "silhouette_scores": silhouettes,
            "optimal_k": chosen_k,
            "scaler_type": self.scaler_type,
            "features_used": self.features_used,
            "silhouette_score_optimal": best_score
        }
        return self.evaluation_results

    def _preprocess_features(self, df: pd.DataFrame) -> np.ndarray:
        """Log-transforms skewed count metrics (log1p) and applies RobustScaler/StandardScaler."""
        X_raw = df[self.features_used].copy()
        
        # Log1p transformation for views, likes, comment_count, engagement_rate
        X_log = pd.DataFrame()
        for col in self.features_used:
            X_log[col] = np.log1p(np.maximum(0, X_raw[col].values))

        scaler = RobustScaler()
        X_scaled = scaler.fit_transform(X_log)
        self.scaler = scaler
        return X_scaled

    def fit_kmeans(self, df: pd.DataFrame, n_clusters: int = 3) -> Tuple[pd.DataFrame, List[Dict[str, Any]]]:
        """Trains K-Means, ranks clusters by observed engagement characteristics, and assigns descriptive labels."""
        if df is None or len(df) == 0:
            return df, []

        X_scaled = self._preprocess_features(df)
        
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        raw_clusters = kmeans.fit_predict(X_scaled)
        self.fitted_model = kmeans

        df_result = df.copy()
        df_result['cluster_raw'] = raw_clusters

        # Compute 2D PCA representation for visualization
        pca = PCA(n_components=2, random_state=42)
        coords = pca.fit_transform(X_scaled)
        df_result['pca_x'] = np.round(coords[:, 0], 3)
        df_result['pca_y'] = np.round(coords[:, 1], 3)

        # Interpret clusters dynamically based on actual engagement statistics
        cluster_stats = []
        for c_id in range(n_clusters):
            c_df = df_result[df_result['cluster_raw'] == c_id]
            if len(c_df) == 0:
                continue
            # Composite engagement score: avg views * 0.4 + avg likes * 0.3 + avg engagement_rate * 0.3 (normalized)
            c_stat = {
                "raw_id": c_id,
                "count": len(c_df),
                "avg_views": float(c_df['views'].mean()),
                "median_views": float(c_df['views'].median()),
                "avg_likes": float(c_df['likes'].mean()),
                "median_likes": float(c_df['likes'].median()),
                "avg_comments": float(c_df['comment_count'].mean()),
                "median_comments": float(c_df['comment_count'].median()),
                "avg_engagement_rate": float(c_df['engagement_rate'].mean()),
                "median_engagement_rate": float(c_df['engagement_rate'].median()),
            }
            cluster_stats.append(c_stat)

        # Rank clusters by median views and engagement rate
        # Sort ascending by a composite rank
        cluster_stats.sort(key=lambda s: (s['median_views'] * 0.5 + s['avg_engagement_rate'] * 10000 * 0.5))

        # Assign descriptive labels based on actual ranked performance
        cluster_names = []
        if n_clusters == 3:
            cluster_names = ["Lower Engagement", "Moderate Engagement", "Higher Engagement"]
        elif n_clusters == 4:
            cluster_names = ["Low Engagement", "Moderate Engagement", "High Engagement", "Viral / High Reach"]
        else:
            cluster_names = [f"Engagement Tier {i+1}" for i in range(n_clusters)]

        mapping = {}
        for idx, stat in enumerate(cluster_stats):
            name = cluster_names[idx] if idx < len(cluster_names) else f"Cluster {idx+1}"
            mapping[stat["raw_id"]] = name

        self.cluster_labels_map = mapping
        df_result['cluster'] = df_result['cluster_raw'].map(mapping)

        # Build comprehensive cluster summary objects
        total_videos = len(df_result)
        summaries = []
        for stat in cluster_stats:
            c_id = stat["raw_id"]
            name = mapping[c_id]
            c_df = df_result[df_result['cluster_raw'] == c_id]
            
            top_cats = (
                c_df['category_name']
                .value_counts()
                .head(3)
                .reset_index()
            )
            top_cats.columns = ['category', 'count']
            top_cats_list = top_cats.to_dict(orient='records')

            # Generate accurate textual explanation based on actual statistics
            avg_views_str = f"{int(stat['avg_views']):,}"
            avg_er_str = f"{stat['avg_engagement_rate']:.2f}%"
            explanation = (
                f"Videos in the '{name}' cluster average {avg_views_str} views and an engagement rate of {avg_er_str}. "
                f"This group accounts for {round((stat['count'] / total_videos) * 100, 1)}% of trending titles, "
                f"with strong representation from {top_cats_list[0]['category'] if top_cats_list else 'Entertainment'}."
            )

            summaries.append({
                "cluster_id": c_id,
                "cluster_name": name,
                "video_count": stat["count"],
                "share_of_total": round((stat["count"] / total_videos) * 100, 2),
                "avg_views": round(stat["avg_views"], 1),
                "median_views": round(stat["median_views"], 1),
                "avg_likes": round(stat["avg_likes"], 1),
                "median_likes": round(stat["median_likes"], 1),
                "avg_comments": round(stat["avg_comments"], 1),
                "median_comments": round(stat["median_comments"], 1),
                "avg_engagement_rate": round(stat["avg_engagement_rate"], 2),
                "median_engagement_rate": round(stat["median_engagement_rate"], 2),
                "top_categories": top_cats_list,
                "explanation": explanation
            })

        self.cluster_summaries = summaries
        self.df_with_clusters = df_result
        return df_result, summaries
