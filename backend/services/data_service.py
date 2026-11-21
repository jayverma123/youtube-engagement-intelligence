import os
import json
import logging
from datetime import datetime, timezone
from typing import Dict, List, Optional, Tuple, Any
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

class DataService:
    def __init__(self, base_dir: str):
        self.base_dir = base_dir
        self.raw_dir = os.path.join(base_dir, "data", "raw")
        self.processed_dir = os.path.join(base_dir, "data", "processed")
        self.metadata_dir = os.path.join(base_dir, "data", "category_metadata")
        
        os.makedirs(self.raw_dir, exist_ok=True)
        os.makedirs(self.processed_dir, exist_ok=True)
        os.makedirs(self.metadata_dir, exist_ok=True)
        
        self.current_country = "IN"
        self.df_trending: Optional[pd.DataFrame] = None
        self.df_unique: Optional[pd.DataFrame] = None
        self.category_maps: Dict[str, Dict[int, str]] = {}
        self.audit_info: Dict[str, Any] = {}
        
        self.supported_countries = [
            {"code": "IN", "name": "India", "filename": "INvideos.csv"},
            {"code": "US", "name": "United States", "filename": "USvideos.csv"},
            {"code": "GB", "name": "Great Britain", "filename": "GBvideos.csv"},
            {"code": "CA", "name": "Canada", "filename": "CAvideos.csv"},
            {"code": "DE", "name": "Germany", "filename": "DEvideos.csv"},
            {"code": "FR", "name": "France", "filename": "FRvideos.csv"},
            {"code": "JP", "name": "Japan", "filename": "JPvideos.csv"},
            {"code": "KR", "name": "South Korea", "filename": "KRvideos.csv"},
            {"code": "MX", "name": "Mexico", "filename": "MXvideos.csv"},
            {"code": "RU", "name": "Russia", "filename": "RUvideos.csv"},
        ]
        
        # Load category metadata
        self._load_all_category_metadata()
        # Initialize default or available dataset
        self.init_dataset()

    def _load_all_category_metadata(self):
        for c in self.supported_countries:
            code = c["code"]
            json_file = os.path.join(self.metadata_dir, f"{code}_category_id.json")
            if not os.path.exists(json_file):
                json_file = os.path.join(self.metadata_dir, "IN_category_id.json")
                if not os.path.exists(json_file):
                    json_file = os.path.join(self.metadata_dir, "US_category_id.json")
            
            mapping = {}
            if os.path.exists(json_file):
                try:
                    with open(json_file, "r", encoding="utf-8") as f:
                        data = json.load(f)
                        for item in data.get("items", []):
                            cat_id = int(item["id"])
                            cat_title = item["snippet"]["title"]
                            mapping[cat_id] = cat_title
                except Exception as e:
                    logger.error(f"Error parsing category metadata for {code}: {e}")
            self.category_maps[code] = mapping

    def get_category_name(self, country_code: str, category_id: int) -> str:
        mapping = self.category_maps.get(country_code, {})
        if category_id in mapping:
            return mapping[category_id]
        in_map = self.category_maps.get("IN", {})
        if category_id in in_map:
            return in_map[category_id]
        us_map = self.category_maps.get("US", {})
        if category_id in us_map:
            return us_map[category_id]
        return f"Category {category_id}"

    def list_available_countries(self) -> List[Dict[str, Any]]:
        result = []
        for c in self.supported_countries:
            csv_path = os.path.join(self.raw_dir, c["filename"])
            is_avail = os.path.exists(csv_path)
            count = 0
            if is_avail:
                try:
                    count = sum(1 for _ in open(csv_path, 'r', encoding='utf-8', errors='ignore')) - 1
                except Exception:
                    count = 1
            result.append({
                "code": c["code"],
                "name": c["name"],
                "filename": c["filename"],
                "available": is_avail,
                "record_count": max(0, count)
            })
        return result

    def init_dataset(self, country_code: Optional[str] = None):
        target = country_code or self.current_country
        csv_path = os.path.join(self.raw_dir, f"{target}videos.csv")
        
        if not os.path.exists(csv_path):
            avail = [c for c in self.supported_countries if os.path.exists(os.path.join(self.raw_dir, c["filename"]))]
            if avail:
                target = avail[0]["code"]
                csv_path = os.path.join(self.raw_dir, avail[0]["filename"])
            else:
                self.current_country = target
                self.df_trending = None
                self.df_unique = None
                self.audit_info = {
                    "country": target,
                    "filename": f"{target}videos.csv",
                    "original_records": 0,
                    "duplicates_removed": 0,
                    "invalid_records_removed": 0,
                    "missing_values_handled": 0,
                    "final_records": 0,
                    "unique_videos": 0,
                    "categories_count": 0,
                    "date_range": {"min": "", "max": ""},
                    "data_quality_score": 100.0,
                    "missing_pct": 0.0,
                    "duplicate_pct": 0.0,
                    "features_available": [],
                    "last_processed": datetime.now(timezone.utc).isoformat(),
                    "dataset_source": "Kaggle YouTube Trending Videos (datasnaek/youtube-new)",
                    "limitations": [
                        "Historical archive (2017-2018). Does not reflect YouTube's live real-time API.",
                        "YouTube officially discontinued public Trending pages in July 2025.",
                        "Clustering models describe observed performance patterns, not causal determinants."
                    ]
                }
                return

        self.current_country = target
        self._load_and_process_csv(csv_path, target)

    def _load_and_process_csv(self, file_path: str, country_code: str):
        try:
            try:
                df_raw = pd.read_csv(file_path, encoding='utf-8', on_bad_lines='skip')
            except UnicodeDecodeError:
                df_raw = pd.read_csv(file_path, encoding='latin-1', on_bad_lines='skip')
        except Exception as e:
            logger.error(f"Failed to read CSV {file_path}: {e}")
            return

        original_count = len(df_raw)
        
        required_cols = ['video_id', 'title', 'channel_title', 'category_id', 'views', 'likes', 'comment_count']
        missing_cols = [c for c in required_cols if c not in df_raw.columns]
        if missing_cols:
            logger.error(f"Missing required columns in CSV: {missing_cols}")
            return

        # 1. Missing values handling
        before_drop_na = len(df_raw)
        df = df_raw.dropna(subset=['video_id', 'title', 'views']).copy()
        missing_handled = before_drop_na - len(df)

        # 2. Type conversions and numeric validations
        for num_col in ['views', 'likes', 'comment_count']:
            df[num_col] = pd.to_numeric(df[num_col], errors='coerce').fillna(0).astype(int)
        
        if 'dislikes' in df.columns:
            df['dislikes'] = pd.to_numeric(df['dislikes'], errors='coerce').fillna(0).astype(int)
        else:
            df['dislikes'] = 0

        df['category_id'] = pd.to_numeric(df['category_id'], errors='coerce').fillna(0).astype(int)

        # 3. Invalid records removal (negative views, likes, or comments)
        valid_mask = (df['views'] >= 0) & (df['likes'] >= 0) & (df['comment_count'] >= 0)
        invalid_count = len(df) - valid_mask.sum()
        df = df[valid_mask].copy()

        # Handle zero views to avoid division by zero
        df['views_safe'] = df['views'].apply(lambda v: max(v, 1))

        # 4. Fill text columns
        df['title'] = df['title'].fillna('Untitled').astype(str)
        df['channel_title'] = df['channel_title'].fillna('Unknown Channel').astype(str)
        if 'thumbnail_link' not in df.columns:
            df['thumbnail_link'] = ''
        else:
            df['thumbnail_link'] = df['thumbnail_link'].fillna('').astype(str)

        # 5. Date conversions
        if 'publish_time' in df.columns:
            df['publish_time'] = pd.to_datetime(df['publish_time'], errors='coerce')
        else:
            df['publish_time'] = pd.to_datetime('2017-01-01')

        # 6. Map Category Names
        df['category_name'] = df['category_id'].apply(lambda cid: self.get_category_name(country_code, cid))

        # 7. Engagement Metrics Calculation
        # Engagement Rate (%) = ((Likes + Comments) / Views) * 100
        df['engagement_rate'] = ((df['likes'] + df['comment_count']) / df['views_safe']) * 100.0
        df['engagement_rate'] = df['engagement_rate'].round(2)
        
        df['like_to_view_ratio'] = (df['likes'] / df['views_safe']).round(4)
        df['comment_to_view_ratio'] = (df['comment_count'] / df['views_safe']).round(4)

        # 8. Handling Trending vs Video-Level Deduplication
        self.df_trending = df.copy()

        # Sort by views descending so keeping first keeps maximum recorded engagement
        df_sorted = df.sort_values(by=['views', 'likes', 'comment_count'], ascending=False)
        df_unique_videos = df_sorted.drop_duplicates(subset=['video_id'], keep='first').copy()
        
        duplicates_removed = len(df) - len(df_unique_videos)
        self.df_unique = df_unique_videos

        # Date range
        min_date = str(df['publish_time'].min())[:10] if not df['publish_time'].isnull().all() else ""
        max_date = str(df['publish_time'].max())[:10] if not df['publish_time'].isnull().all() else ""

        # Data quality score calculation: 100 - (missing_pct + invalid_pct)
        missing_pct = round((missing_handled / max(original_count, 1)) * 100, 2)
        dup_pct = round((duplicates_removed / max(original_count, 1)) * 100, 2)
        quality_score = round(max(0, 100.0 - missing_pct - (invalid_count / max(original_count, 1) * 100)), 1)

        self.audit_info = {
            "country": country_code,
            "filename": os.path.basename(file_path),
            "original_records": original_count,
            "duplicates_removed": duplicates_removed,
            "invalid_records_removed": int(invalid_count),
            "missing_values_handled": int(missing_handled),
            "final_records": len(df),
            "unique_videos": len(df_unique_videos),
            "categories_count": int(df['category_name'].nunique()),
            "date_range": {"min": min_date, "max": max_date},
            "data_quality_score": quality_score,
            "missing_pct": missing_pct,
            "duplicate_pct": dup_pct,
            "features_available": list(df.columns),
            "last_processed": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "dataset_source": "Kaggle YouTube Trending Videos (datasnaek/youtube-new)",
            "limitations": [
                "Dataset contains historical archived records (2017-2018), not live streaming video metrics.",
                "YouTube officially discontinued public Trending pages in July 2025; trending feeds are now algorithmic.",
                "K-Means clustering indicates observational clustering of past performance, not predictive virality."
            ]
        }
        logger.info(f"Loaded dataset for {country_code}: {self.audit_info}")

    def save_uploaded_csv(self, file_content: bytes, filename: str) -> Tuple[bool, str]:
        try:
            target_path = os.path.join(self.raw_dir, filename)
            with open(target_path, "wb") as f:
                f.write(file_content)
            
            code = "CUSTOM"
            if len(filename) >= 7 and filename.endswith("videos.csv"):
                code = filename[:2].upper()
            
            self.init_dataset(code if any(c["code"] == code for c in self.supported_countries) else None)
            return True, f"Successfully uploaded and processed {filename}"
        except Exception as e:
            return False, f"Failed to save and process CSV: {str(e)}"
