import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Spinner,
  useToast,
  useColorModeValue,
} from '@chakra-ui/react';

// Chessboard color themes
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

function ChaptersPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const colorMode = useColorModeValue('light', 'dark');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`http://localhost:10000/api/modules/${moduleId}/chapters`);
        if (!res.ok) throw new Error('Error fetching chapters');
        const data = await res.json();
        setChapters(data);
      } catch (error) {
        toast({
          title: 'Error fetching chapters',
          description: error.message,
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [moduleId, toast]);

  return (
    <Box p={8}>
      <Heading mb={10} textAlign="center" mt="10">Chapters for Module {moduleId.replace(/\D/g, '')}</Heading>

      {loading ? (
        <Spinner size="xl" />
      ) : chapters.length === 0 ? (
        <Text>No chapters found for this module.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          {chapters.map((chapter, index) => {
            const theme = boardThemes[index % boardThemes.length];
            const lightColor = colorMode === 'light' ? theme.lightMode.lightSq : theme.darkMode.lightSq;
            const darkColor = colorMode === 'light' ? theme.lightMode.darkSq : theme.darkMode.darkSq;
            const textColor = colorMode === 'light' ? theme.lightMode.text : theme.darkMode.text;

            return (
              <Box
                key={chapter.chapter_id}
                p={70}
                bgGradient={`linear(to-br, ${lightColor}, ${darkColor})`}
                color={textColor}
                borderRadius="lg"
                height="250"
                boxShadow="md"
                transition="transform 0.3s ease, box-shadow 0.3s ease"
                _hover={{
                  transform: 'scale(1.05) rotate(2deg)',
                  boxShadow: 'xl',
                  cursor: 'pointer',
                }}
                onClick={() => navigate(`/api/stories/${chapter.chapter_id}`)}
              >
                <Heading size="md" mb={2}>
                  {chapter.chapter_id}
                </Heading>
                <Text fontSize="lg">{chapter.chapter_name}</Text>
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default ChaptersPage;
