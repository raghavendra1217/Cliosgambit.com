import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Input,
  VStack,
  Text,
  Spinner,
  useColorModeValue,
  Badge,
  ButtonGroup,
  Button,
  Tooltip,
  Card,
  CardBody,
  IconButton,
} from '@chakra-ui/react';
import { LockIcon, UnlockIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../AppContext';
import { useRoleStoryAccess } from '../hooks/useRoleStoryAccess';

const ADMIN_EDITABLE_ROLES = ['student', 'guest'];

function StoriesPage() {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adminEditRole, setAdminEditRole] = useState('student');
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isGuest = !user;
  const isCoach = user?.role === 'coach';
  const roleToEdit = isAdmin ? adminEditRole : isStudent ? 'student' : 'guest';
  const { storyAccess, updateStoryAccess, loading: roleAccessLoading } = useRoleStoryAccess(roleToEdit);
  const [stories, setStories] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Colors
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const cardHoverBg = useColorModeValue('blue.100', 'blue.600');
  const textColor = useColorModeValue('gray.700', 'gray.100');
  const inputBg = useColorModeValue('white', 'gray.800');
  const inputBorderColor = useColorModeValue('gray.300', 'gray.600');
  const inputPlaceholderColor = useColorModeValue('gray.500', 'gray.400');
  const cardBorderColor = useColorModeValue('gray.200', 'gray.600');

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

  const handleRoleStoryToggle = async (storyId, isUnlocked) => {
    let newAccess;
    if (isUnlocked) {
      newAccess = storyAccess.filter((id) => id !== storyId);
    } else {
      newAccess = [...storyAccess, storyId];
    }
    await updateStoryAccess(newAccess);
  };

  if (loading || roleAccessLoading) {
    return (
      <Box textAlign="center" mt={10}>
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box p={8} bg={bgColor} minH="100vh">
      <Heading mb={6} textAlign="center" color={textColor}>
        Chess Stories
      </Heading>
      {isAdmin && (
        <Card w="100%" maxW={{ base: '100%', md: 'lg' }} mx="auto" bg={bgColor} borderColor="teal.300" borderWidth={1} boxShadow="md" mb={6}>
          <CardBody>
            <VStack spacing={2} align="stretch">
              <Badge colorScheme="green" fontSize={{ base: 'sm', md: 'md' }} p={2} alignSelf="flex-start">
                Admin Access - All stories unlocked
              </Badge>
              <ButtonGroup mt={2} flexDirection={{ base: 'column', sm: 'row' }} w="100%">
                {ADMIN_EDITABLE_ROLES.map((role) => (
                  <Button
                    key={role}
                    colorScheme={adminEditRole === role ? 'teal' : 'gray'}
                    variant={adminEditRole === role ? 'solid' : 'outline'}
                    onClick={() => setAdminEditRole(role)}
                    w={{ base: '100%', sm: 'auto' }}
                    mb={{ base: 2, sm: 0 }}
                  >
                    Edit {role.charAt(0).toUpperCase() + role.slice(1)} Access
                  </Button>
                ))}
              </ButtonGroup>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" mt={1}>
                Editing access for: <b>{adminEditRole}</b>
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}
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
      <VStack spacing={6} align="stretch">
        {filteredStories.map(story => {
          // Only check storyAccess for the selected role when admin is editing
          const isUnlockedForRole = storyAccess.includes(String(story.story_id));
          return (
            <Box
              key={story.story_id}
              p={{ base: 3, md: 6 }}
              bg={cardBg}
              color={textColor}
              borderRadius="md"
              boxShadow="md"
              borderWidth="1px"
              borderColor={cardBorderColor}
              position="relative"
              opacity={isAdmin || isCoach || isUnlockedForRole ? 1 : 0.6}
              cursor={isAdmin || isCoach || (isStudent && isUnlockedForRole) || (isGuest && isUnlockedForRole) ? 'pointer' : 'not-allowed'}
              transition="all 0.3s ease"
              _hover={{
                bg: cardHoverBg,
                transform: 'translateY(-5px)',
                boxShadow: 'lg',
              }}
              onClick={() => (isAdmin || isCoach || (isStudent && isUnlockedForRole) || (isGuest && isUnlockedForRole)) && navigate(`/api/story/${story.story_id}`)}
            >
              {/* Admin Lock/Unlock Button */}
              {isAdmin && (
                <Tooltip label={isUnlockedForRole ? `Lock for ${adminEditRole}` : `Unlock for ${adminEditRole}`} placement="top" hasArrow>
                  <IconButton
                    icon={isUnlockedForRole ? <UnlockIcon color="green.500" boxSize={{ base: 7, md: 5 }} /> : <LockIcon color="red.500" boxSize={{ base: 7, md: 5 }} />}
                    variant="solid"
                    bg={isUnlockedForRole ? 'white' : 'white'}
                    border={isUnlockedForRole ? '1px solid #38A169' : '1px solid #E53E3E'}
                    _hover={{ bg: isUnlockedForRole ? 'white' : 'white' }}
                    size={{ base: 'lg', md: 'sm' }}
                    position="absolute"
                    top={2}
                    right={2}
                    zIndex={10}
                    aria-label={isUnlockedForRole ? `Lock for ${adminEditRole}` : `Unlock for ${adminEditRole}`}
                    style={{ opacity: 1 }}
                    onClick={e => {
                      e.stopPropagation();
                      handleRoleStoryToggle(story.story_id, isUnlockedForRole);
                    }}
                  />
                </Tooltip>
              )}
              <Heading size="md" mb={2}>
                {story.title}
              </Heading>
              <Text fontSize="md">{story.description}</Text>
              {isStudent && !isUnlockedForRole && (
                <Badge colorScheme="red" mt={2}>
                  Locked
                </Badge>
              )}
              {isAdmin && !isUnlockedForRole && (
                <Badge colorScheme="red" mt={2}>
                  Locked for {adminEditRole.charAt(0).toUpperCase() + adminEditRole.slice(1)}
                </Badge>
              )}
              {isGuest && !isUnlockedForRole && (
                <Badge colorScheme="red" mt={2}>
                  Locked
                </Badge>
              )}
            </Box>
          );
        })}
      </VStack>
    </Box>
  );
}

export default StoriesPage;
