import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { AppProvider } from './AppContext';
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import ModulePage from './pages/ModulePage';
import ChaptersPage from './pages/ChaptersPage';
import StoriesPage from './pages/StoriesPage';
import StoryDetails from './pages/StoryDetails';
import MappingDetails from './pages/MappingDetails';
import ChessGame from './pages/ChessGame';
import AccessControlPage from './pages/AccessControlPage';
import ActivityTrackerPage from './pages/ActivityTrackerPage';
import Stopwatch from './components/Stopwatch';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './AppContext';

function AppRoutes() {
  const { user } = useAuth();
  const location = useLocation();
  const showStopwatch =
    user?.role === 'coach' &&
    /^\/api\/story\/[^/]+\/mapping\/[^/]+$/.test(location.pathname);

  return (
    <Box>
      <NavBar />
      {showStopwatch && <Stopwatch />}
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ModulePage />} />
        <Route path="/api/module/:moduleId" element={<ChaptersPage />} />
        <Route path="/api/stories/:chapterId" element={<StoriesPage />} />
        <Route path="/api/story/:storyId" element={<StoryDetails />} />
        <Route path="/api/story/:storyId/mapping/:mappingId" element={<MappingDetails />} />
        {/* --- ADMIN ONLY ROUTE --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/api/access-control" element={<AccessControlPage />} />
          <Route path="/api/activity-tracker" element={<ActivityTrackerPage />} />
        </Route>
        {/* --- ALL AUTHENTICATED USERS ROUTES --- */}
        <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'coach']} />}>
          <Route path="/api/chess" element={<ChessGame />} />
        </Route>
      </Routes>
    </Box>
  );
}

function AppContent() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;