import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import { AppProvider } from './AppContext';

// Page Imports
import NavBar from './components/NavBar';
import LoginPage from './pages/LoginPage';
import ModulePage from './pages/ModulePage';
import ChaptersPage from './pages/ChaptersPage';
import StoriesPage from './pages/StoriesPage';
import StoryDetails from './pages/StoryDetails';
import MappingDetails from './pages/MappingDetails';
import PlayersPage from './pages/PlayersPage';
import ChessGame from './pages/ChessGame';
import AccessControlPage from './pages/AccessControlPage';
import ActivityTrackerPage from './pages/ActivityTrackerPage';
import Stopwatch from './components/Stopwatch';


// Auth Component
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './AppContext';

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      {user?.role === 'coach' && <Stopwatch />}
      <Router>
        <Box>
          <NavBar />
          <Routes>
            {/* --- PUBLIC ROUTES --- */}
            {/* Anyone can see the login page */}
            <Route path="/login" element={<LoginPage />} />
            {/* Anyone can see the module page */}
            <Route path="/" element={<ModulePage />} />
            {/* Anyone can see the chapters page */}
            <Route path="/api/module/:moduleId" element={<ChaptersPage />} />
            {/* Anyone can see the stories page */}
            <Route path="/api/stories/:chapterId" element={<StoriesPage />} />
            {/* Anyone can see the story details page */}
            <Route path="/api/story/:storyId" element={<StoryDetails />} />
            {/* Anyone can see the mapping details page */}
            <Route path="/api/story/:storyId/mapping/:mappingId" element={<MappingDetails />} />

            {/* --- ADMIN ONLY ROUTE --- */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/api/access-control" element={<AccessControlPage />} />
              <Route path="/api/activity-tracker" element={<ActivityTrackerPage />} />
            </Route>

            {/* --- ALL AUTHENTICATED USERS ROUTES --- */}
            <Route element={<ProtectedRoute allowedRoles={['student', 'admin', 'coach']} />}>
              <Route path="/api/chess" element={<ChessGame />} />
              <Route path="/api/players" element={<PlayersPage />} />
              {/* Add any other routes here - admin will have access to all */}
            </Route>

          </Routes>
        </Box>
      </Router>
    </>
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