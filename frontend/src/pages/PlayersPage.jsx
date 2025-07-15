import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Text,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  VStack,
  Select,
  Grid,
  Heading,
  useColorModeValue,
  Tooltip,
  HStack,
  Flex,
} from '@chakra-ui/react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Dot } from 'recharts';
import { BsCircleFill } from 'react-icons/bs';

// --- Reusable Sub-Components ---

const RatingChart = ({ data, strokeColor, joiningDate }) => {
    const tooltipBg = useColorModeValue('white', 'gray.800');
    const tooltipBorder = useColorModeValue('gray.200', 'gray.600');
    const gridStroke = useColorModeValue('gray.200', 'gray.700');
    const MAX_PLOT_POINTS = 150;

    const { chartData, joiningDateOnChart } = useMemo(() => {
        if (!data || data.length === 0) return { chartData: [], joiningDateOnChart: null };
        let processedData;
        if (data.length <= MAX_PLOT_POINTS) {
            processedData = data.map((game, index) => ({ ...game, gameNumber: index + 1 }));
        } else {
            const groupSize = Math.ceil(data.length / MAX_PLOT_POINTS);
            processedData = [];
            for (let i = 0; i < data.length; i += groupSize) {
                const chunk = data.slice(i, i + groupSize);
                const avgRating = Math.round(chunk.reduce((sum, g) => sum + g.rating, 0) / chunk.length);
                processedData.push({ ...chunk[chunk.length-1], rating: avgRating, gameNumber: i + chunk.length });
            }
        }
        let joiningDateLabel = null;
        if (joiningDate) {
            const joinTimestamp = new Date(joiningDate).getTime();
            const joiningIndex = processedData.findIndex(g => new Date(g.date).getTime() >= joinTimestamp);
            if (joiningIndex !== -1) {
                processedData[joiningIndex].isJoiningPoint = true;
                joiningDateLabel = new Date(processedData[joiningIndex].date).toLocaleDateString();
            }
        }
        return { chartData: processedData, joiningDateOnChart: joiningDateLabel };
    }, [data, joiningDate]);

    const yAxisProps = useMemo(() => {
        if (chartData.length === 0) return { domain: [0, 1500] };
        let minRating = Infinity, maxRating = -Infinity;
        chartData.forEach(p => { minRating = Math.min(minRating, p.rating); maxRating = Math.max(maxRating, p.rating); });
        const domainMin = Math.floor((minRating - 50) / 50) * 50;
        const domainMax = Math.ceil((maxRating + 50) / 50) * 50;
        return { domain: [domainMin, domainMax] };
    }, [chartData]);
    
    const renderJoiningDot = (props) => {
        const { cx, cy, payload } = props;
        if (payload.isJoiningPoint) {
            return <Dot cx={cx} cy={cy} r={5} fill="orange.400" stroke="orange.400" />;
        }
        return null;
    };

    if (chartData.length === 0) {
      return <Center h="250px"><Text>No data available for this category.</Text></Center>;
    }

    return (
        <Box h="250px" position="relative">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 15, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" dataKey="gameNumber" domain={['dataMin', 'dataMax']} tick={{ fontSize: 10 }} />
                    <YAxis domain={yAxisProps.domain} allowDecimals={false} tick={{ fontSize: 10 }} />
                    <RechartsTooltip 
                        contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}` }} 
                        labelFormatter={(label) => `Game #${label}`}
                        formatter={(value, name, props) => [value, `Rating on ${new Date(props.payload.date).toLocaleDateString()}`]}
                    />
                    <Line type="monotone" dataKey="rating" stroke={strokeColor} strokeWidth={2.5} dot={renderJoiningDot} activeDot={{ r: 7 }} name="Rating" />
                </LineChart>
            </ResponsiveContainer>
            {joiningDateOnChart && (
                <Flex align="center" position="absolute" top={0} right={2} fontSize="xs" color="gray.500">
                    <Box as={BsCircleFill} color="orange.400" size="10px" mr={2}/>
                    <Text>Joined: {joiningDateOnChart}</Text>
                </Flex>
            )}
        </Box>
    );
};

const StatItem = ({ label, value, valueColor = 'inherit' }) => {
    const borderColor = useColorModeValue('gray.200', 'gray.700');
    return (
        <Flex w="100%" justify="space-between" align="baseline" borderBottom="1px dotted" borderColor={borderColor} pb={2}>
            <Text fontSize="sm" color="gray.500">{label}</Text>
            <Text fontSize="lg" fontWeight="bold" color={valueColor}>{value ?? 'N/A'}</Text>
        </Flex>
    );
};

const ImprovementStat = ({ label, value }) => {
    const color = value > 0 ? 'green.500' : value < 0 ? 'red.500' : 'gray.500';
    const displayValue = value !== null && !isNaN(value) ? `${value > 0 ? '+' : ''}${value}` : 'N/A';
    return <StatItem label={label} value={displayValue} valueColor={color} />;
};

const Legend = ({ items }) => (
    <HStack spacing={4} mt={3} justify="flex-end">
      {items.map((item) => (
        <HStack key={item.label} spacing={1.5} align="center">
          <Box w="12px" h="12px" bg={item.color} borderRadius="sm" />
          <Text fontSize="xs" color="gray.500">{item.label}</Text>
        </HStack>
      ))}
    </HStack>
);

const LinearActivityTracker = ({ title, data, getColor, getTooltipLabel, LegendComponent }) => {
    const today = new Date().toISOString().split('T')[0];

    return (
        <VStack align="stretch" spacing={2}>
            <Heading as="h3" size="md">{title}</Heading>
            <HStack spacing={1}>
                {data.map(({ date, value }) => (
                    <Tooltip key={date} label={getTooltipLabel(value, date)} placement="top" hasArrow>
                        <Box
                            flex="1" // Allows boxes to fill the space
                            h={{ base: "16px", md: "20px" }}
                            bg={getColor(value)}
                            borderRadius="sm"
                            transition="transform 0.1s ease-in-out"
                            border={date === today ? "2px solid" : "none"}
                            borderColor="blue.400"
                            _hover={{ transform: 'scale(1.3)', zIndex: 1, boxShadow: 'lg' }}
                        />
                    </Tooltip>
                ))}
            </HStack>
             <Flex justify="space-between">
                <Text fontSize="xs" color="gray.500">30 days ago</Text>
                <Text fontSize="xs" color="gray.500">Today</Text>
            </Flex>
            {LegendComponent && <LegendComponent />}
        </VStack>
    );
};

// --- The Main Page Component ---
const PlayersPage = () => {
  const [allPlayersData, setAllPlayersData] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [liveStats, setLiveStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const selectBg = useColorModeValue('white', 'gray.700');
  const panelBg = useColorModeValue('gray.50', 'gray.800');
  const emptyHeatmapColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100');
  
  const activityColor = (count) => {
    if (count === 0) return emptyHeatmapColor;
    if (count <= 2) return 'green.200';
    if (count <= 5) return 'green.400';
    return 'green.600';
  };
  const attendanceColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'present': return 'green.400';
        case 'absent': return 'red.300';
        default: return emptyHeatmapColor;
    }
  };

  const activityLegendItems = [
    { label: 'None', color: emptyHeatmapColor },
    { label: '1-2', color: 'green.200' },
    { label: '3-5', color: 'green.400' },
    { label: '5+', color: 'green.600' },
  ];
  const attendanceLegendItems = [
    { label: 'Present', color: 'green.400' },
    { label: 'Absent', color: 'red.300' },
    { label: 'No Record', color: emptyHeatmapColor },
  ];


  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch('/api/players/reports');
        if (!response.ok) throw new Error('Failed to fetch player reports.');
        const data = await response.json();
        setAllPlayersData(data.players || []);
        if (data.players && data.players.length > 0) {
            setSelectedPlayerId(data.players[0].Chess_com_ID);
        }
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchReports();
  }, []);

  useEffect(() => {
    if (!selectedPlayerId) { setLiveStats(null); return; }
    const fetchLiveStats = async () => {
      setLoading(true); setError(null);
      try {
        const response = await fetch(`https://api.chess.com/pub/player/${selectedPlayerId}/stats`);
        if (!response.ok) throw new Error(`Failed to fetch live stats for ${selectedPlayerId}.`);
        const data = await response.json();
        setLiveStats(data);
      } catch (err) { setError(err.message); } finally { setLoading(false); }
    };
    fetchLiveStats();
  }, [selectedPlayerId]);
  
  const selectedPlayerData = useMemo(() => allPlayersData.find(p => p.Chess_com_ID === selectedPlayerId), [allPlayersData, selectedPlayerId]);

  const allStats = useMemo(() => {
    if (!selectedPlayerData || !liveStats) return {};
    const getStats = (history, liveTimeCategory) => {
        if (!history || history.length === 0) return { joiningRating: null, improvement: null };
        const joinDate = new Date(selectedPlayerData.Joining_Date);
        const firstGameAfterJoining = history.find(g => new Date(g.date) >= joinDate);
        const joiningRating = firstGameAfterJoining?.rating;
        const improvement = joiningRating && liveTimeCategory?.last?.rating ? liveTimeCategory.last.rating - joiningRating : null;
        return { joiningRating, improvement };
    };
    return {
        rapid: getStats(selectedPlayerData.rapid_graph, liveStats.chess_rapid),
        blitz: getStats(selectedPlayerData.blitz_graph, liveStats.chess_blitz),
    };
  }, [selectedPlayerData, liveStats]);

  const activityData = useMemo(() => {
    if (!selectedPlayerData) return { activity: [], attendance: [] };
    const gameCounts = new Map();
    [...(selectedPlayerData.rapid_graph || []), ...(selectedPlayerData.blitz_graph || [])].forEach(game => {
        const gameDate = new Date(game.date).toISOString().split('T')[0];
        gameCounts.set(gameDate, (gameCounts.get(gameDate) || 0) + 1);
    });
    
    const activityDays = [], attendanceDays = [];
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        activityDays.push({ date: dateString, value: gameCounts.get(dateString) || 0 });
        attendanceDays.push({ date: dateString, value: selectedPlayerData.Attendance?.[dateString] || 'No Record' });
    }
    return { activity: activityDays, attendance: attendanceDays };
  }, [selectedPlayerData]);

  const Panel = ({ children, ...props }) => (
    <VStack 
        bg={panelBg} 
        p={{base: 4, md: 6}} 
        borderRadius="lg" 
        shadow="sm" 
        spacing={6} 
        align="stretch"
        transition="box-shadow 0.2s ease-in-out"
        _hover={{ shadow: 'md' }}
        {...props}
    >
        {children}
    </VStack>
  );

  if (loading && allPlayersData.length === 0) {
    return <Center h="80vh"><Spinner size="xl" /></Center>;
  }
  
  return (
    <Box p={{ base: 4, md: 8 }} w="full">
      <VStack spacing={8} align="stretch">
        <Select placeholder="Select a Player..." size="lg" value={selectedPlayerId} onChange={(e) => setSelectedPlayerId(e.target.value)} isDisabled={allPlayersData.length === 0} bg={selectBg} shadow="sm">
            {allPlayersData.map(p => (<option key={p.Chess_com_ID} value={p.Chess_com_ID}>{p.Player_Name} ({p.Chess_com_ID})</option>))}
        </Select>
        
        {loading && selectedPlayerId && <Center h="60vh"><Spinner size="xl" /></Center>}
        {error && <Alert status="error" borderRadius="md"><AlertIcon />{error}</Alert>}

        {!loading && selectedPlayerData && (
          <VStack spacing={8} align="stretch">
            {/* --- TOP SECTION: STATS & GRAPHS --- */}
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8} alignItems="start">
                {/* --- Left Column: Stats --- */}
                <Panel>
                    <Box textAlign="center">
                        <Heading size="xl">{selectedPlayerData.Player_Name}</Heading>
                        <Text fontSize="md" color="gray.500">Course Joining Date: {new Date(selectedPlayerData.Joining_Date).toLocaleDateString()}</Text>
                    </Box>
                    <VStack spacing={0} align="stretch" sx={{ '& > div:last-of-type': { border: 'none' } }}>
                        <Heading size="md" mb={3}>Rapid Stats</Heading>
                        <StatItem label="Joining Rating" value={allStats.rapid?.joiningRating} />
                        <StatItem label="Current Rating" value={liveStats?.chess_rapid?.last?.rating} />
                        <StatItem label="Best Rating" value={liveStats?.chess_rapid?.best?.rating} />
                        <ImprovementStat label="Improvement" value={allStats.rapid?.improvement} />
                        <StatItem label="Record (W/L/D)" value={`${liveStats?.chess_rapid?.record?.win ?? 'N/A'}/${liveStats?.chess_rapid?.record?.loss ?? 'N/A'}/${liveStats?.chess_rapid?.record?.draw ?? 'N/A'}`} />
                    </VStack>
                    <VStack spacing={0} align="stretch" sx={{ '& > div:last-of-type': { border: 'none' } }}>
                        <Heading size="md" mb={3}>Blitz Stats</Heading>
                        <StatItem label="Joining Rating" value={allStats.blitz?.joiningRating} />
                        <StatItem label="Current Rating" value={liveStats?.chess_blitz?.last?.rating} />
                        <StatItem label="Best Rating" value={liveStats?.chess_blitz?.best?.rating} />
                        <ImprovementStat label="Improvement" value={allStats.blitz?.improvement} />
                        <StatItem label="Record (W/L/D)" value={`${liveStats?.chess_blitz?.record?.win ?? 'N/A'}/${liveStats?.chess_blitz?.record?.loss ?? 'N/A'}/${liveStats?.chess_blitz?.record?.draw ?? 'N/A'}`} />
                    </VStack>
                </Panel>
                {/* --- Right Column: Graphs --- */}
                <VStack spacing={8} align="stretch">
                    <Panel p={4}>
                        <Heading size="md" textAlign="center" mb={4}>Rapid Performance vs. Experience</Heading>
                        <RatingChart data={selectedPlayerData.rapid_graph} strokeColor="#3182CE" joiningDate={selectedPlayerData.Joining_Date} />
                    </Panel>
                    <Panel p={4}>
                        <Heading size="md" textAlign="center" mb={4}>Blitz Performance vs. Experience</Heading>
                        <RatingChart data={selectedPlayerData.blitz_graph} strokeColor="#38A169" joiningDate={selectedPlayerData.Joining_Date} />
                    </Panel>
                </VStack>
            </Grid>

            {/* --- BOTTOM SECTION: ACTIVITY TRACKERS --- */}
            <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={8}>
                <Panel>
                    <LinearActivityTracker title="Daily Game Activity" data={activityData.activity} getColor={activityColor} getTooltipLabel={(count, date) => `${count} games on ${new Date(date).toLocaleDateString()}`} 
                        LegendComponent={() => <Legend items={activityLegendItems} />}
                    />
                </Panel>
                <Panel>
                    <LinearActivityTracker title="Attendance" data={activityData.attendance} getColor={attendanceColor} getTooltipLabel={(status, date) => `${status} on ${new Date(date).toLocaleDateString()}`} 
                        LegendComponent={() => <Legend items={attendanceLegendItems} />}
                    />
                </Panel>
            </Grid>
          </VStack>
        )}
      </VStack>
    </Box>
  );
};

export default PlayersPage;