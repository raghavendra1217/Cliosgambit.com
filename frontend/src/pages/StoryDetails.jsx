import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, Text, Spinner, Flex, Image, useColorModeValue } from '@chakra-ui/react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';

function StoryDetails() {
  const { storyId } = useParams();
  const [story, setStory] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMappingId, setSelectedMappingId] = useState(null);

  // Color scheme
  const pageBg = useColorModeValue('gray.50', 'gray.800');
  const cardBg = useColorModeValue('white', 'gray.700');
  const cardHoverBg = useColorModeValue('blue.100', 'blue.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const subTextColor = useColorModeValue('gray.500', 'gray.400');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');
  const mappingBg = useColorModeValue('gray.100', 'gray.600');  // ✅ FIXED → added this for mapping box bg

  useEffect(() => {
    axios.get(`http://localhost:10000/api/stories/${storyId}`)
      .then(response => {
        setStory(response.data);
      })
      .catch(error => {
        console.error('Error fetching story info:', error);
      });

    axios.get(`http://localhost:10000/api/story-mappings/${storyId}`)
      .then(response => {
        setMappings(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching mappings:', error);
      });
  }, [storyId]);

  if (loading || !story) {
    return (
      <Box p={8} textAlign="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={8} bg={pageBg} minH="100vh">
      <Flex gap={10} align="flex-start" flexWrap={{ base: "wrap", md: "nowrap" }}>
        
        {/* Left Box - Text contents */}
        <Box flex="1">
          <Heading mb={3} color={textColor}>{story.title}</Heading>
          <Text fontSize="lg" color={subTextColor} mb={6}>{story.description}</Text>

          <Heading size="md" mb={4} color={textColor}>Story Details</Heading>

          <VStack spacing={4} align="stretch">
            {mappings.map((mapping) => (
              <Box
                as={RouterLink}
                to={`/api/story/${storyId}/mapping/${mapping.mapping_id}`}
                key={mapping.mapping_id}
                p={4}
                bg={mappingBg} // ✅ Fixed hook usage
                borderRadius="md"
                transition="all 0.3s ease"
                cursor="pointer"
                _hover={{
                  bg: cardHoverBg,
                  transform: 'translateY(-2px)',
                  boxShadow: 'lg',
                }}
                onClick={() => setSelectedMappingId(mapping.mapping_id)}
              >
                <Text color={textColor}>{mapping.story_text}</Text>
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Right Box - Image */}
        <Box flex="1" display="flex" justifyContent="center" alignItems="center">
          <Image 
            src={`/story_images/${parseInt(storyId.replace(/\D/g, ''), 10)}.png`} 
            alt={storyId} 
            borderRadius="md"
            objectFit="cover"
            width="85%" // ✅ Made 85% → as per your latest instruction
            aspectRatio="1 / 1" 
            fallbackSrc="https://via.placeholder.com/400x400?text=No+Image"
          />
        </Box>

      </Flex>
    </Box>
  );
}

export default StoryDetails;
