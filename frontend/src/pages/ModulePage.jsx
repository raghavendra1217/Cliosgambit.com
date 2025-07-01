
import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  Container,
  useColorModeValue,
  VStack,
} from '@chakra-ui/react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Chessboard Themes
const boardThemes = [
  {
    lightMode: { lightSq: '#ebecd0', darkSq: '#779556', text: 'gray.800' },
    darkMode: { lightSq: '#B5CAA3', darkSq: '#779556', text: 'whiteAlpha.900' },
  },
  {
    lightMode: { lightSq: '#f0d9b5', darkSq: '#b58863', text: 'gray.800' },
    darkMode: { lightSq: '#D8C6A8', darkSq: '#8B6950', text: 'whiteAlpha.900' },
  },
  {
    lightMode: { lightSq: '#dee3e6', darkSq: '#8ca2ad', text: 'gray.800' },
    darkMode: { lightSq: '#A0B0B8', darkSq: '#647E8A', text: 'whiteAlpha.900' },
  },
  {
    lightMode: { lightSq: '#e6e6fa', darkSq: '#9370db', text: 'gray.800' },
    darkMode: { lightSq: '#B8A8E0', darkSq: '#6A4CAF', text: 'whiteAlpha.900' },
  },
  {
    lightMode: { lightSq: '#ffebcd', darkSq: '#ff7f50', text: 'gray.800' },
    darkMode: { lightSq: '#FFCBAA', darkSq: '#D96C44', text: 'whiteAlpha.900' },
  },
];

function ModulePage() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const colorMode = useColorModeValue('light', 'dark');
  const pageTextColor = useColorModeValue('gray.700', 'gray.200');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get('/api/modules');
        setModules(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch modules');
      } finally {
        setLoading(false);
      }
    };

    fetchModules();
  }, []);

  if (loading) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
        <Text mt={4}>Loading modules...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8} textAlign="center" color="red.500">
        <Heading size="md" mb={4}>Error</Heading>
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <Heading mb={8} textAlign="center" size="2xl" color={pageTextColor}>
        Modules
      </Heading>
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={8}>
        {modules.map((module, index) => {
          const theme = boardThemes[index % boardThemes.length];
          const lightColor = colorMode === 'light' ? theme.lightMode.lightSq : theme.darkMode.lightSq;
          const darkColor = colorMode === 'light' ? theme.lightMode.darkSq : theme.darkMode.darkSq;
          const textColor = colorMode === 'light' ? theme.lightMode.text : theme.darkMode.text;

          return (
            <Box
              key={module.module_id}
              bgGradient={`linear(to-br, ${lightColor}, ${darkColor})`}
              borderRadius="lg"
              boxShadow="md"
              height = "250"
              p={5}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              fontWeight="bold"
              fontSize="xl"
              cursor="pointer"
              transition="all 0.3s ease"
              color={textColor}
              _hover={{
                transform: 'scale(1.05)',
                boxShadow: 'xl',
              }}
              onClick={() => navigate(`/api/module/${module.module_id}`)}
            >
              <Heading size="lg" mb={3}>
                0{index + 1}
              </Heading>
              <Text fontSize="lg">{module.module_name}</Text>
            </Box>
          );
        })}
      </SimpleGrid>
    </Container>
  );
}

export default ModulePage;
