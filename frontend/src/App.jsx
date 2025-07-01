// App.jsx

import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';
import NavBar from './components/NavBar';
import StoriesPage from './pages/StoriesPage';
import ChessGame from './pages/ChessGame';
import StoryDetails from './pages/StoryDetails';
import MappingDetails from './pages/MappingDetails';
import ModulePage from './pages/ModulePage';
import ChaptersPage from './pages/ChaptersPage';
import PlayersPage from './pages/PlayersPage';
// Imports for BrilliantPage and AnalysisViewerPage have been removed
import { AppProvider } from './AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Box>
          <NavBar />
          <Routes>
            <Route path="/" element={<ModulePage />} />
            <Route path="/api/module/:moduleId" element={<ChaptersPage />} />
            <Route path="/api/stories/:chapterId" element={<StoriesPage />} />
            <Route path="/api/chess" element={<ChessGame />} />
            <Route path="/api/story/:storyId" element={<StoryDetails />} />
            <Route path="/api/story/:storyId/mapping/:mappingId" element={<MappingDetails />} />
            <Route path="/api/players" element={<PlayersPage />} />
            
            {/* The routes for /analysis and /analysis/:gameLink have been removed */}

          </Routes>
        </Box>
      </Router>
    </AppProvider>
  );
}

export default App;