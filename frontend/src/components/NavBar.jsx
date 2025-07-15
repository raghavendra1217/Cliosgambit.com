// components/NavBar.jsx

import React from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Link,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorMode,
  useColorModeValue,
} from '@chakra-ui/react';
import { MoonIcon, SunIcon, HamburgerIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';
import CelebrationButton from './CelebrationButton';
import CameraToggleButton from './CameraToggleButton';

function NavBar() {
  const { colorMode, toggleColorMode } = useColorMode();

  const bgColor = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)');
  const backdropFilter = 'blur(8px)';
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  return (
    <Box
      position="sticky"
      top="0"
      zIndex="999"
      bg={bgColor}
      backdropFilter={backdropFilter}
      borderBottom="1px solid"
      borderColor={borderColor}
      px={{ base: 4, md: 8 }}
      py={3}
      boxShadow="sm"
    >
      <Flex align="center" justify="space-between">
        <Heading as="h1" size={{ base: 'md', md: 'lg' }} color="teal.500">
          <Link as={RouterLink} to="/" _hover={{ textDecoration: 'none' }}>
            Chess By Panchatantra
          </Link>
        </Heading>

        {/* --- DESKTOP NAVIGATION --- */}
        <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
          <CelebrationButton />
          <CameraToggleButton />

          <IconButton
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            aria-label="Toggle color mode"
            color={textColor}
            _hover={{ bg: useColorModeValue('gray.200', 'gray.600') }}
          />
          {/* "Players" link has been removed from here */}
          <Link as={RouterLink} to="/" color="teal.500" fontSize="lg" _hover={{ textDecoration: 'underline' }}>
            Modules
          </Link>
        </HStack>

        {/* --- MOBILE NAVIGATION (HAMBURGER MENU) --- */}
        <Flex display={{ base: 'flex', md: 'none' }} align="center">
          <IconButton
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            aria-label="Toggle color mode"
            color={textColor}
          />
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              variant="outline"
              aria-label="Open menu"
            />
            <MenuList>
              {/* "Players" menu item has been removed from here */}
              <MenuItem as={RouterLink} to="/">
                Modules
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
}

export default NavBar;