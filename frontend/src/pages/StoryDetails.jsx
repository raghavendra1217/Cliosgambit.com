import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  VStack,
  Text,
  Spinner,
  Image,
  Flex,
  useColorModeValue,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

// Component for the list of mappings (to avoid repetition)
const MappingsList = ({ mappings, mappingBg, cardHoverBg, textColor, storyId }) => (
  <VStack spacing={4} align="stretch" w="100%">
    <Heading as="h2" size="lg" mb={0} mt={4} color={textColor}>
      Story Details
    </Heading>
    {mappings.map((mapping) => (
      <Box
        as={RouterLink}
        to={`/api/story/${storyId}/mapping/${mapping.mapping_id}`}
        key={mapping.mapping_id}
        p={4}
        bg={mappingBg}
        borderRadius="md"
        transition="all 0.3s ease"
        cursor="pointer"
        _hover={{
          bg: cardHoverBg,
          transform: 'translateY(-2px)',
          boxShadow: 'md',
        }}
      >
        <Text color={textColor}>{mapping.story_text}</Text>
      </Box>
    ))}
  </VStack>
);

function StoryDetails() {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);

  const isMobile = useBreakpointValue({ base: true, md: false });

  // Color scheme
  const pageBg = useColorModeValue('gray.50', 'gray.800');
  const cardHoverBg = useColorModeValue('blue.100', 'blue.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const mappingBg = useColorModeValue('gray.100', 'gray.600');

  useEffect(() => {
    setLoading(true);
    const storyPromise = axios.get(`/api/stories/${storyId}`);
    const mappingsPromise = axios.get(`/api/story-mappings/${storyId}`);

    Promise.all([storyPromise, mappingsPromise])
      .then(([storyResponse, mappingsResponse]) => {
        setStory(storyResponse.data);
        setMappings(mappingsResponse.data);
      })
      .catch(error => console.error('Error fetching story details:', error))
      .finally(() => setLoading(false));
  }, [storyId]);

  if (loading) {
    return <Box p={8} textAlign="center"><Spinner size="xl" /></Box>;
  }
  if (!story) {
    return <Box p={8} textAlign="center"><Heading size="lg">Story not found.</Heading></Box>;
  }

  // Reusable content blocks
  const TitleDescription = (
    <Box>
      <Heading as="h1" size={{ base: 'xl', md: '2xl' }} mb={3} color={textColor}>{story.title}</Heading>
      <Text fontSize={{ base: 'md', md: 'lg' }} color={subTextColor}>{story.description}</Text>
    </Box>
  );

  const StoryImage = (
    <Image 
      src={`/story_images/${parseInt(storyId.replace(/\D/g, ''), 10)}.png`} 
      alt={story.title} 
      borderRadius="md"
      objectFit="cover"
      // FIX IS HERE (1/2): Responsive width for the image
      width={{ base: '100%', md: '85%' }} 
      aspectRatio="1 / 1" 
      boxShadow="xl"
      fallbackSrc="https://via.placeholder.com/400x400?text=Story+Image"
    />
  );
  
  const commonMappingsProps = { mappings, mappingBg, cardHoverBg, textColor, storyId };

  return (
    <Box p={{ base: 4, md: 8 }} bg={pageBg} minH="100vh">
      {isMobile ? (
        // --- MOBILE LAYOUT --- (No changes here, remains perfect)
        <VStack spacing={6} align="stretch">
          {TitleDescription}
          {StoryImage}
          <MappingsList {...commonMappingsProps} />
        </VStack>
      ) : (
        // --- LAPTOP LAYOUT ---
        <Flex gap={10} align="flex-start">
          {/* Left Box - Text contents */}
          <VStack flex="1" spacing={6} align="stretch">
            {TitleDescription}
            <MappingsList {...commonMappingsProps} />
          </VStack>

          {/* Right Box - Image */}
          {/* FIX IS HERE (2/2): Re-add centering to the container */}
          <Box flex="1" display="flex" justifyContent="center" alignItems="center">
            {StoryImage}
          </Box>
        </Flex>
      )}
    </Box>
  );
}

export default StoryDetails;