import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Grid,
  GridItem,
  Tooltip,
  Flex,
  VStack,
} from '@chakra-ui/react';

// --- Helper Functions ---

/**
 * Determines the color for the activity square based on game count.
 * @param {number} count - The number of games played.
 * @returns {string} A color string for Chakra UI.
 */
const getActivityColor = (count) => {
  if (count <= 0) return 'gray.300';
  if (count >= 1 && count <= 2) return 'green.200';
  if (count >= 3 && count <= 5) return 'green.400';
  if (count >= 6 && count <= 9) return 'green.600';
  if (count >= 10) return 'green.800';
  return 'gray.300';
};

/**
 * Formats a Date object into a 'YYYY-MM-DD' string.
 * @param {Date} date - The date object to format.
 * @returns {string} The formatted date string.
 */
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Generates an array of date strings for the last 30 days.
 * @returns {string[]} An array of dates from 30 days ago to today.
 */
const getLast30Days = () => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates.reverse(); // Return in chronological order (oldest to newest)
};


// --- The Main Component ---
const PlayersPage = () => {
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredPlayerId, setHoveredPlayerId] = useState(null);

  // --- UI Layout Adjustments ---
  const playerNameColumnWidth = "280px";
  const activitySquareSize = "24px";
  const gridColumnGap = "4px";
  const gridRowGap = "10px";
  const hoverBgColor = "blue.100";

  /**
   * Fetches player list and recent games, then processes them into a displayable format.
   */
  const fetchAndProcessData = async () => {
    // Don't show spinner for background refreshes
    if (!processedData) setLoading(true); 
    setError(null);
    try {
      // 1. Define the date range for the last 30 days
      const allDates = getLast30Days();
      const startDate = allDates[0];
      const endDate = allDates[allDates.length - 1];

      // 2. Fetch both players and games concurrently for efficiency
      const [playerResponse, gamesResponse] = await Promise.all([
        fetch('/api/get_players'),
        fetch(`/api/player-games?startDate=${startDate}&endDate=${endDate}`)
      ]);

      if (!playerResponse.ok) throw new Error('Failed to fetch player list from the server.');
      if (!gamesResponse.ok) throw new Error('Failed to fetch player games from the server.');

      const { players: playersList } = await playerResponse.json();
      const { games: gameList } = await gamesResponse.json();

      // 3. Process the raw data: Create a map for quick lookup.
      // This is the key step to aggregate game counts per player per day.
      // We convert all IDs to lowercase to handle case-sensitivity issues.
      const activityMap = {};
      for (const game of gameList) {
        const chess_com_id_lower = game.chess_com_id.toLowerCase();
        const { date } = game;
        
        if (!activityMap[chess_com_id_lower]) {
          activityMap[chess_com_id_lower] = {};
        }
        activityMap[chess_com_id_lower][date] = (activityMap[chess_com_id_lower][date] || 0) + 1;
      }
      
      // 4. Combine the player list with the processed activity data.
      const finalPlayersData = playersList.map(player => {
        // Use lowercase ID for the lookup to ensure a match.
        const player_id_lower = player.Chess_com_ID ? player.Chess_com_ID.toLowerCase() : '';
        
        const activity_data = allDates.map(date => {
          const playerActivity = activityMap[player_id_lower];
          return playerActivity?.[date] || 0; // Return count for the date, or 0 if none
        });

        return { ...player, activity_data };
      });
      
      // 5. Set the final data structure needed for rendering.
      const dataToRender = {
          last_30_days: allDates,
          players: finalPlayersData
      };
      
      setProcessedData(dataToRender);
      
    } catch (err) {
      console.error('Error fetching or processing player data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAndProcessData();
    // Set up a periodic refresh every 10 minutes
    const interval = setInterval(fetchAndProcessData, 600000); 

    // Cleanup the interval when the component is unmounted
    return () => clearInterval(interval); 
  }, []);
  
  // --- Render Logic ---

  if (loading) {
    return (
      <Center height="80vh">
        <Spinner size="xl" /> <Text ml={3}>Loading Player Activity...</Text>
      </Center>
    );
  }

  if (error) {
    return (
      <Center height="80vh" p={4}>
        <Alert status="error" flexDirection="column" alignItems="center" justifyContent="center" textAlign="center">
          <AlertIcon boxSize="40px" mr={0} />
          <Text mt={4} mb={2} fontSize="lg" fontWeight="bold">Error Fetching Data</Text>
          <Text>{error}</Text>
          <Text mt={2} fontSize="sm" color="gray.500">
            Please ensure the backend server is running and the database is accessible.
          </Text>
        </Alert>
      </Center>
    );
  }

  if (!processedData || !processedData.players || !processedData.last_30_days) {
    return (
      <Center height="80vh" p={4}>
        <Alert status="warning"><AlertIcon />No player activity data available to display.</Alert>
      </Center>
    );
  }

  const { last_30_days, players } = processedData;

  return (
    <VStack spacing={8} p={8} alignItems="stretch" w="full">
      <Text fontSize="3xl" fontWeight="bold" textAlign="left">
        Player Activity - Last 30 Days
      </Text>

      {players.length === 0 ? (
        <Text>No players found in the database.</Text>
      ) : (
        <Box overflowX="auto" w="full" py={2}>
          <Grid
            templateColumns={`${playerNameColumnWidth} repeat(${last_30_days.length}, minmax(${activitySquareSize}, 1fr))`}
            columnGap={gridColumnGap}
            rowGap={gridRowGap}
            alignItems="center"
            minWidth={`calc(${playerNameColumnWidth} + (${last_30_days.length} * (${activitySquareSize} + ${gridColumnGap})))`}
          >
            <GridItem /> {/* Empty cell for alignment */}
            {last_30_days.map((date, index) => (
              <GridItem key={`header-date-${index}`} textAlign="center">
                <Tooltip label={date} placement="top" hasArrow>
                  <Text fontSize="sm" color="gray.600" h={activitySquareSize} display="flex" alignItems="flex-end" justifyContent="center">
                    {date.substring(8, 10)}
                  </Text>
                </Tooltip>
              </GridItem>
            ))}

            {players.map((player) => {
              const playerId = player.Chess_com_ID || player.Player_Name;
              const isHovered = hoveredPlayerId === playerId;

              return (
                <React.Fragment key={playerId}>
                  <GridItem
                    pr={4}
                    pl={2}
                    fontSize="lg"
                    textAlign="left"
                    whiteSpace="nowrap"
                    overflow="hidden"
                    textOverflow="ellipsis"
                    h={activitySquareSize}
                    display="flex"
                    alignItems="center"
                    onMouseEnter={() => setHoveredPlayerId(playerId)}
                    onMouseLeave={() => setHoveredPlayerId(null)}
                    bg={isHovered ? hoverBgColor : 'transparent'}
                    borderLeftRadius={isHovered ? "md" : "none"}
                    transition="background-color 0.1s ease-in-out"
                    cursor="default"
                  >
                    <Tooltip label={player.Player_Name} placement="right" hasArrow openDelay={500}>
                       <Text as="span">{player.Player_Name}</Text>
                    </Tooltip>
                  </GridItem>

                  {player.activity_data.map((count, dayIndex) => (
                    <GridItem
                      key={`activity-${playerId}-${dayIndex}`}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      h={activitySquareSize}
                      onMouseEnter={() => setHoveredPlayerId(playerId)}
                      onMouseLeave={() => setHoveredPlayerId(null)}
                      bg={isHovered ? hoverBgColor : 'transparent'}
                      borderRightRadius={isHovered && dayIndex === last_30_days.length - 1 ? "md" : "none"}
                      transition="background-color 0.1s ease-in-out"
                    >
                      <Tooltip label={`${last_30_days[dayIndex]}: ${count} games`} placement="top" hasArrow openDelay={300}>
                        <Box
                          w={activitySquareSize}
                          h={activitySquareSize}
                          bg={getActivityColor(count)}
                          borderRadius="4px"
                          border={count <= 0 ? "1px solid" : "none"}
                          borderColor={count <= 0 ? "gray.400" : "transparent"}
                        />
                      </Tooltip>
                    </GridItem>
                  ))}
                </React.Fragment>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Legend */}
      <Flex mt={4} justifyContent="flex-end" alignItems="center" w="full" pr={4}>
        <Text fontSize="md" mr={3}>Less</Text>
        {[0, 1, 3, 6, 10].map(count => (
            <Tooltip key={`legend-${count}`} label={`${count === 10 ? '10+' : count} games`} placement="top" hasArrow>
                <Box
                    w={activitySquareSize} h={activitySquareSize} bg={getActivityColor(count)} m="2px" borderRadius="4px"
                    border={count <= 0 ? "1px solid" : "none"} borderColor={count <= 0 ? "gray.400" : "transparent"}
                />
            </Tooltip>
        ))}
        <Text fontSize="md" ml={3}>More</Text>
      </Flex>
    </VStack>
  );
};

export default PlayersPage;