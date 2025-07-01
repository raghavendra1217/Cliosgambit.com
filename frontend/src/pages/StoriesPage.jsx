import React, { useEffect, useState } from 'react';
import { Box, Heading, Input, VStack, Text, Spinner, useColorModeValue } from '@chakra-ui/react';
import axios from 'axios';
import { Link as RouterLink, useParams } from 'react-router-dom';

function StoriesPage() {
  const { chapterId } = useParams();
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('blue.100', 'blue.600');  // better hover color
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const inputPlaceholderColor = useColorModeValue('gray.500', 'gray.400');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');  // ✅ FIXED

  useEffect(() => {
    axios.get(`/api/chapters/${chapterId}/stories`)
      .then(response => {
        setStories(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching stories:', error);
      });
  }, [chapterId]);

  const filteredStories = stories.filter(story =>
    story.title.toLowerCase().includes(search.toLowerCase()) ||
    story.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={8} bg={bgColor} minH="100vh">
      <Heading mb={6} textAlign="center" color={textColor}>
        Chess Stories
      </Heading>

      <Box maxW="600px" mx="auto" mb={10}>
        <Input
          placeholder="Search stories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="lg"
          bg={inputBg}
          color={textColor}
          borderColor={inputBorderColor}
          _placeholder={{ color: inputPlaceholderColor }}
        />
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <Spinner size="xl" />
        </Box>
      ) : (
        <VStack spacing={6} align="stretch">
          {filteredStories.map(story => (
            <Box
              key={story.story_id}
              as={RouterLink}
              to={`/api/story/${story.story_id}`}
              p={6}
              bg={cardBg}
              color={textColor}
              borderRadius="md"
              boxShadow="md"
              borderWidth="1px"
              borderColor={cardBorderColor}
              transition="all 0.3s ease"
              _hover={{
                bg: cardHoverBg,
                transform: 'translateY(-5px)',
                boxShadow: 'lg',
                cursor: 'pointer',
              }}
            >
              <Heading size="md" mb={2}>
                {story.title}
              </Heading>
              <Text fontSize="md">{story.description}</Text>
            </Box>
          ))}
        </VStack>
      )}
    </Box>
  );
}

export default StoriesPage;
