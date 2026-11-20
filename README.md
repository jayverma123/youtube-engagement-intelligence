# YouTube Engagement Intelligence
## Machine Learning-Based Trending Video Analysis & Engagement Clustering

YouTube Engagement Intelligence is a specialized, production-ready full-stack analytics application designed to analyze historical YouTube trending-video datasets, calculate authentic audience interaction metrics, and perform unsupervised K-Means clustering to uncover content engagement tiers.

---

## 1. Project Overview & Guiding Questions

Online videos generate varying levels of viewership and interaction. High view counts do not always translate into high proportional viewer engagement. This application addresses five fundamental analytical questions:

1. **How does engagement vary across video categories?** (e.g. Music, Entertainment, News, Comedy)
2. **What relationships exist between views, likes, and comments?**
3. **Can videos be grouped into distinct engagement patterns using Machine Learning?**
4. **What characteristics distinguish the resulting groups?**
5. **What actionable takeaways can content creators derive from observed patterns?**

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide React, Recharts.
- **Backend**: Python 3.10+, FastAPI, Uvicorn, Pandas, NumPy, Scikit-Learn, Pydantic.
- **Machine Learning**: Scikit-Learn (K-Means, RobustScaler, PCA, Silhouette Score, Elbow WCSS Inertia).
- **Architecture**: Decoupled RESTful API with automated dataset auditing, multi-country detection, and dynamic cluster profiling.

---

## 3. Dataset Setup & Source

- **Dataset**: Kaggle YouTube Trending Videos Dataset ([datasnaek/youtube-new](https://www.kaggle.com/datasets/datasnaek/youtube-new)).
- **Country Datasets Expected**: `INvideos.csv` (Default: India), `USvideos.csv`, `GBvideos.csv`, `CAvideos.csv`, `FRvideos.csv`, `DEvideos.csv`, `JPvideos.csv`, `KRvideos.csv`, `MXvideos.csv`, `RUvideos.csv`.
- **Directory Structure**:
```
backend/
├── data/
│   ├── raw/                 <- Place country CSV files here (e.g., INvideos.csv, USvideos.csv)
│   ├── processed/           <- Cleaned and cached Parquet/CSV artifacts
│   └── category_metadata/   <- JSON category mappings (e.g., IN_category_id.json)
```

---

## 4. Analytical Formulas & Methodology

### Engagement Rate Formula
$$\text{Engagement Rate (\%)} = \left(\frac{\text{Likes} + \text{Comments}}{\max(\text{Views}, 1)}\right) \times 100$$

- **Like-to-View Ratio**: $\frac{\text{Likes}}{\max(\text{Views}, 1)}$
- **Comment-to-View Ratio**: $\frac{\text{Comments}}{\max(\text{Views}, 1)}$

### Machine Learning Workflow
1. **Cleaning & Deduplication**: Removes corrupted and negative records. Separates video-level deduplicated views from historical daily trending observation records.
2. **Feature Engineering**: Selects `[views, likes, comment_count, engagement_rate]`.
3. **Transformation**: Skewed count distributions are transformed via $\log(1 + x)$ (`np.log1p`).
4. **Scaling**: Preprocessed with `RobustScaler` to prevent outliers from distorting cluster centroids.
5. **Evaluation**:
   - **Elbow Method**: Within-Cluster Sum of Squares (Inertia).
   - **Silhouette Score**: Evaluates cluster cohesion and separation ($[-1, +1]$).
6. **Dynamic Cluster Labeling**: Cluster labels (e.g., *Lower Engagement*, *Moderate Engagement*, *Higher Engagement*) are assigned **after** calculating actual cluster centroids and median engagement values rather than relying on arbitrary cluster indices.

---

## 5. Running the Application Locally

### Step 1: Start the Backend (FastAPI)
```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend will be live at `http://localhost:8000` (Interactive Swagger Docs at `http://localhost:8000/docs`).

### Step 2: Start the Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend will be running at `http://localhost:3000`.

---

## 6. API Endpoints

- `GET /api/health`: Health status and dataset state.
- `GET /api/dataset/info`: Record audit, cleaning statistics, and dates.
- `GET /api/dataset/countries`: List available and detected country CSVs.
- `POST /api/dataset/select?country_code=IN`: Select and load country dataset.
- `POST /api/dataset/upload`: Upload compatible custom Kaggle CSV.
- `GET /api/analytics/overview?level=video`: Global KPIs and ratio analysis.
- `GET /api/analytics/categories?level=video`: Category breakdown and rankings.
- `GET /api/analytics/relationships?limit=400`: Scatter plot points and Pearson correlation matrix.
- `GET /api/analytics/trends`: Monthly timeline distribution.
- `POST /api/ml/train`: Trigger K-Means retraining with custom $k$.
- `GET /api/ml/evaluation`: Elbow inertia curve and Silhouette scores.
- `GET /api/ml/clusters`: Dynamic cluster summaries and textual explanations.
- `GET /api/videos`: Paginated video table with search, category, cluster, and sorting filters.
- `GET /api/insights/creator-takeaways`: Dynamic data-backed creator takeaways.

---

## 7. Known Limitations
- The dataset represents historical trending records and is not a real-time streaming YouTube feed.
- K-Means clusters identify observed audience interaction tiers; they do not predict the future virality of unpublished content.
