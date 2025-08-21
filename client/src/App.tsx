import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { LoadingPage } from '@/components/ui/loading';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { ChatPage } from '@/pages/ChatPage';
import { QuickActionsPage } from '@/pages/QuickActionsPage';
import { AboutPage } from '@/pages/AboutPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { StudyToolsPage } from '@/pages/StudyToolsPage';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Suspense fallback={<LoadingPage message="Loading page..." />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/quick-actions" element={<QuickActionsPage />} />
              <Route path="/study-tools" element={<StudyToolsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster />
      </Router>
    </ErrorBoundary>
  );
}

export default App;