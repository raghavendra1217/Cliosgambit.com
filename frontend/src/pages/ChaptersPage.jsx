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
  Badge,
  VStack,
  ButtonGroup,
  Button,
  Tooltip,
  Card,
  CardBody,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { useAuth } from '../AppContext';
import { LockIcon, UnlockIcon, HamburgerIcon } from '@chakra-ui/icons';
import { useRoleChapterAccess } from '../hooks/useRoleChapterAccess';

const boardThemes = [
  { lightMode: { lightSq: '#ebecd0', darkSq: '#779556', text: 'gray.800' }, darkMode: { lightSq: '#B5CAA3', darkSq: '#779556', text: 'whiteAlpha.900' } },
  { lightMode: { lightSq: '#f0d9b5', darkSq: '#b58863', text: 'gray.800' }, darkMode: { lightSq: '#D8C6A8', darkSq: '#8B6950', text: 'whiteAlpha.900' } },
  { lightMode: { lightSq: '#dee3e6', darkSq: '#8ca2ad', text: 'gray.800' }, darkMode: { lightSq: '#A0B0B8', darkSq: '#647E8A', text: 'whiteAlpha.900' } },
  { lightMode: { lightSq: '#e6e6fa', darkSq: '#9370db', text: 'gray.800' }, darkMode: { lightSq: '#B8A8E0', darkSq: '#6A4CAF', text: 'whiteAlpha.900' } },
  { lightMode: { lightSq: '#ffebcd', darkSq: '#ff7f50', text: 'gray.800' }, darkMode: { lightSq: '#FFCBAA', darkSq: '#D96C44', text: 'whiteAlpha.900' } },
];

const ADMIN_EDITABLE_ROLES = ['student', 'guest'];

function ChaptersPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [adminEditRole, setAdminEditRole] = useState('student');
  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isGuest = !user;
  const isCoach = user?.role === 'coach';
  const roleToEdit = isAdmin ? adminEditRole : isStudent ? 'student' : 'guest';
  const { chapAccess, updateChapAccess, loading: roleAccessLoading } = useRoleChapterAccess(roleToEdit);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const colorMode = useColorModeValue('light', 'dark');

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const res = await fetch(`/api/modules/${moduleId}/chapters`);
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

  const handleRoleChapterToggle = async (chapterId, isUnlocked) => {
    let newAccess;
    if (isUnlocked) {
      newAccess = chapAccess.filter((id) => id !== chapterId);
    } else {
      newAccess = [...chapAccess, chapterId];
    }
    await updateChapAccess(newAccess);
    toast({
      title: 'Success',
      description: `Chapter ${isUnlocked ? 'locked' : 'unlocked'} for ${roleToEdit}`,
      status: 'success',
      duration: 2000,
    });
  };

  if (loading || roleAccessLoading) {
    return <Spinner size="xl" />;
  }

  return (
    <Box p={8}>
      <VStack spacing={4} mb={10} mt="10">
        <Heading textAlign="center">Chapters for Module {moduleId.replace(/\D/g, '')}</Heading>
        {isAdmin && (
          <Card w="100%" maxW={{ base: '100%', md: 'lg' }} mx="auto" bg={colorMode === 'light' ? 'gray.50' : 'gray.700'} borderColor="teal.300" borderWidth={1} boxShadow="md">
            <CardBody>
              <VStack spacing={2} align="stretch">
                <Badge colorScheme="green" fontSize={{ base: 'sm', md: 'md' }} p={2} alignSelf="flex-start">
                  Admin Access - All chapters unlocked
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
      </VStack>
      {chapters.length === 0 ? (
        <Text>No chapters found for this module.</Text>
      ) : (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
          {chapters.map((chapter, index) => {
            const theme = boardThemes[index % boardThemes.length];
            const lightColor = colorMode === 'light' ? theme.lightMode.lightSq : theme.darkMode.lightSq;
            const darkColor = colorMode === 'light' ? theme.lightMode.darkSq : theme.darkMode.darkSq;
            const textColor = colorMode === 'light' ? theme.lightMode.text : theme.darkMode.text;

            // Only check chapAccess for the selected role when admin is editing
            const isUnlockedForRole = chapAccess.includes(String(chapter.chapter_id));

            return (
              <Box
                key={chapter.chapter_id}
                bgGradient={`linear(to-br, ${lightColor}, ${darkColor})`}
                color={textColor}
                borderRadius="lg"
                minH={{ base: '180px', md: '220px' }}
                p={{ base: 4, md: 6 }}
                boxShadow="md"
                borderWidth="1px"
                borderColor={isUnlockedForRole ? 'teal.300' : 'gray.300'}
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                position="relative"
                opacity={isAdmin || isCoach || isUnlockedForRole ? 1 : 0.6}
                cursor={isAdmin || isCoach || (isStudent && isUnlockedForRole) || (isGuest && isUnlockedForRole) ? 'pointer' : 'not-allowed'}
                transition="all 0.3s ease"
                _hover={
                  isAdmin || isCoach || (isStudent && isUnlockedForRole) || (isGuest && isUnlockedForRole)
                    ? {
                        transform: 'scale(1.05)',
                        boxShadow: 'xl',
                      }
                    : {}
                }
                onClick={() => (isAdmin || isCoach || (isStudent && isUnlockedForRole) || (isGuest && isUnlockedForRole)) && navigate(`/api/stories/${chapter.chapter_id}`)}
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
                        handleRoleChapterToggle(chapter.chapter_id, isUnlockedForRole);
                      }}
                    />
                  </Tooltip>
                )}
                <Heading size="md" mb={2} textAlign="center" w="100%">
                  {chapter.chapter_id}
                </Heading>
                <Text fontSize="lg" textAlign="center" w="100%">{chapter.chapter_name}</Text>
                {(isStudent || isGuest) && !isUnlockedForRole && (
                  <Badge colorScheme="red" position="absolute" bottom={2} right={2}>
                    Locked
                  </Badge>
                )}
                {isAdmin && !isUnlockedForRole && (
                  <Badge colorScheme="red" position="absolute" bottom={2} right={2}>
                    Locked for {adminEditRole.charAt(0).toUpperCase() + adminEditRole.slice(1)}
                  </Badge>
                )}
              </Box>
            );
          })}
        </SimpleGrid>
      )}
    </Box>
  );
}

export default ChaptersPage;