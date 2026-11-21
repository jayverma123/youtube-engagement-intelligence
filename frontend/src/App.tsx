import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { DatasetTransparencyPage } from './pages/DatasetTransparencyPage';
import { CategoryAnalysisPage } from './pages/CategoryAnalysisPage';
import { EngagementPage } from './pages/EngagementPage';
import { MLClusteringPage } from './pages/MLClusteringPage';
import { ClusterIntelligencePage } from './pages/ClusterIntelligencePage';
import { CreatorTakeawaysPage } from './pages/CreatorTakeawaysPage';
import { VideoExplorerPage } from './pages/VideoExplorerPage';

import {
  DatasetAuditInfo,
  CountryOption,
  KPIOverview,
  CategoryMetric,
  MLEvaluation,
  ClusterSummary,
  CreatorTakeaway,
  RelationshipPoint,
  CorrelationMatrix
} from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentCountry, setCurrentCountry] = useState('IN');
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [auditInfo, setAuditInfo] = useState<DatasetAuditInfo | null>(null);
  const [analysisLevel, setAnalysisLevel] = useState<string>('video');

  const [kpis, setKpis] = useState<KPIOverview | null>(null);
  const [categories, setCategories] = useState<CategoryMetric[]>([]);
  const [trends, setTrends] = useState<any[]>([]);
  const [relationshipData, setRelationshipData] = useState<{
    points: RelationshipPoint[];
    correlation: CorrelationMatrix;
  } | null>(null);
  const [evaluation, setEvaluation] = useState<MLEvaluation | null>(null);
  const [clusters, setClusters] = useState<ClusterSummary[]>([]);
  const [takeaways, setTakeaways] = useState<CreatorTakeaway[]>([]);
  const [isTraining, setIsTraining] = useState(false);

  const loadAllData = async (level: string = analysisLevel) => {
    try {
      const [
        countriesRes,
        infoRes,
        kpisRes,
        catRes,
        trendsRes,
        relRes,
        evalRes,
        clustersRes,
        takeawaysRes
      ] = await Promise.all([
        api.getCountries(),
        api.getDatasetInfo(),
        api.getOverview(level),
        api.getCategories(level),
        api.getTrends(),
        api.getRelationships(500),
        api.getEvaluation(),
        api.getClusters(),
        api.getCreatorTakeaways()
      ]);

      setCountries(countriesRes || []);
      setAuditInfo(infoRes || null);
      setKpis(kpisRes || null);
      setCategories(catRes || []);
      setTrends(trendsRes || []);
      setRelationshipData(relRes || null);
      setEvaluation(evalRes || null);
      setClusters(clustersRes || []);
      setTakeaways(takeawaysRes || []);
    } catch (e) {
      console.error('Failed to load dashboard data:', e);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [currentCountry, analysisLevel]);

  const handleCountryChange = async (newCountry: string) => {
    setCurrentCountry(newCountry);
    try {
      await api.selectCountry(newCountry);
      await loadAllData();
    } catch (e) {
      console.error('Failed to switch country dataset:', e);
    }
  };

  const handleTrainML = async (nClusters: number) => {
    setIsTraining(true);
    try {
      await api.trainML(nClusters);
      await loadAllData();
    } catch (e) {
      alert('Error training K-Means clustering model.');
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <BrowserRouter>
      <DashboardLayout
        auditInfo={auditInfo}
        countries={countries}
        currentCountry={currentCountry}
        onCountryChange={handleCountryChange}
        onUploadSuccess={() => loadAllData()}
      >
        <Routes>
          <Route
            path="/"
            element={
              <OverviewPage
                kpis={kpis}
                categories={categories}
                trends={trends}
                analysisLevel={analysisLevel}
                setAnalysisLevel={setAnalysisLevel}
              />
            }
          />
          <Route
            path="/dataset-transparency"
            element={<DatasetTransparencyPage auditInfo={auditInfo} />}
          />
          <Route
            path="/categories"
            element={<CategoryAnalysisPage categories={categories} />}
          />
          <Route
            path="/engagement"
            element={<EngagementPage relationshipData={relationshipData} />}
          />
          <Route
            path="/ml-clustering"
            element={
              <MLClusteringPage
                evaluation={evaluation}
                clusters={clusters}
                onTrain={handleTrainML}
                isTraining={isTraining}
              />
            }
          />
          <Route
            path="/cluster-intelligence"
            element={
              <ClusterIntelligencePage
                clusters={clusters}
                relationshipData={relationshipData}
              />
            }
          />
          <Route
            path="/creator-takeaways"
            element={<CreatorTakeawaysPage takeaways={takeaways} />}
          />
          <Route
            path="/video-explorer"
            element={<VideoExplorerPage categories={categories} clusters={clusters} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
};
export default App;
