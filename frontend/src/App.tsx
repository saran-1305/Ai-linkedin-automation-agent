import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { moduleRegistry } from './config/moduleRegistry';
import { ModuleWorkspaceTemplate } from './components/templates/ModuleWorkspaceTemplate';
import Layout from './components/layout/Layout';
import { Loader2 } from 'lucide-react';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Login = React.lazy(() => import('./pages/Auth/Login'));
const Signup = React.lazy(() => import('./pages/Auth/Signup'));
const Onboarding = React.lazy(() => import('./pages/Onboarding'));
const Approval = React.lazy(() => import('./pages/Approval'));

const queryClient = new QueryClient();

// AuthGuard component to protect routes
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const ContentIntelligencePage = React.lazy(() => import('./pages/ContentIntelligence'));
const BrandIntelligencePage = React.lazy(() => import('./pages/BrandIntelligence'));
const CompetitorIntelligencePage = React.lazy(() => import('./pages/CompetitorIntelligence'));
const TrendIntelligencePage = React.lazy(() => import('./pages/TrendIntelligence'));
const StrategyPlanner = React.lazy(() => import('./pages/StrategyPlanner').then(m => ({ default: m.StrategyPlanner })));
const WeeklyPlanner = React.lazy(() => import('./pages/WeeklyPlanner').then(m => ({ default: m.WeeklyPlanner })));
const ContentGenerator = React.lazy(() => import('./pages/ContentGenerator').then(m => ({ default: m.ContentGenerator })));
const PublishingCenter = React.lazy(() => import('./pages/PublishingCenter').then(m => ({ default: m.PublishingCenter })));
const OAuthCallback = React.lazy(() => import('./pages/PublishingCenter/components/OAuthCallback'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const PerformanceIntelligence = React.lazy(() => import('./pages/PerformanceIntelligence'));
const Recommendations = React.lazy(() => import('./pages/Recommendations'));
const Settings = React.lazy(() => import('./pages/Settings'));
const BusinessProfile = React.lazy(() => import('./pages/BusinessProfile'));

const moduleComponents: Record<string, React.FC<{ moduleConfig: any }>> = {
  'business-profile': BusinessProfile,
  'historical-analysis': ContentIntelligencePage,
  'brand-intelligence': BrandIntelligencePage,
  'competitor-analysis': CompetitorIntelligencePage,
  'trend-research': TrendIntelligencePage,
  'strategy-planner': StrategyPlanner,
  'weekly-planner': WeeklyPlanner,
  'content-generator': ContentGenerator,
  'publishing-assistant': PublishingCenter,
  'analytics': Analytics,
  'performance-intelligence': PerformanceIntelligence,
  'recommendations': Recommendations,
  'settings': Settings
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/approvals/:token" element={<Approval />} />

              {/* Protected Routes inside Layout */}
              <Route 
                path="/" 
                element={
                  <AuthGuard>
                    <Layout />
                  </AuthGuard>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="onboarding" element={<Onboarding />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="profile" element={<Profile />} />
                <Route path="publishing/callback" element={<OAuthCallback />} />
                
                {/* Dynamic Module Routes */}
                {moduleRegistry.map((module) => {
                  const SpecificPage = moduleComponents[module.id];
                  return (
                    <Route 
                      key={module.id} 
                      path={module.route.replace(/^\//, '')} // Remove leading slash for nested route
                      element={SpecificPage ? <SpecificPage moduleConfig={module} /> : <ModuleWorkspaceTemplate moduleConfig={module} />} 
                    />
                  );
                })}
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
