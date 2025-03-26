import {
  Flex,
  Heading,
  Text,
  Stack,
  HStack,
  Image,
  Icon,
  Button,
  Box
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaGithub, FaLinkedin, FaEnvelope, FaSearch, FaTimes } from 'react-icons/fa'
import { useState } from 'react'

interface ProfileProps {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
}

export function Profile({ name, title, bio, imageUrl }: ProfileProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  
  // Image preview state
  const [showFullImage, setShowFullImage] = useState(false)
  
  const openFullImage = () => setShowFullImage(true)
  const closeFullImage = () => setShowFullImage(false)

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'center', md: 'flex-start' }}
      gap={8}
    >
      <Box
        borderRadius="full"
        boxSize={{ base: '150px', md: '180px', xl: '200px' }}
        border="4px solid"
        borderColor={borderColor}
        overflow="hidden"
        flexShrink={0}
        position="relative"
        bg={bgColor}
        cursor="pointer"
        onClick={openFullImage}
        _hover={{
          transform: 'scale(1.02)',
          transition: 'transform 0.3s ease'
        }}
      >
        <Image
          src={imageUrl}
          alt={`${name}'s profile picture`}
          width="100%"
          height="100%"
          objectFit="cover"
          objectPosition="center 20%"
        />
        
        {/* Overlay with zoom icon on hover */}
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.500"
          display="flex"
          justifyContent="center"
          alignItems="center"
          opacity="0"
          _hover={{ opacity: 1 }}
          transition="opacity 0.3s ease"
        >
          <Icon as={FaSearch} color="white" boxSize={8} />
        </Box>
      </Box>

      <Stack align="flex-start" gap={3} w="100%" flex="1">
        <Heading as="h1" size="xl" color={headingColor}>
          {name}
        </Heading>
        <Text fontSize="xl" fontWeight="medium" color={headingColor}>
          {title}
        </Text>
        <Text color={textColor} fontSize="md">
          {bio}
        </Text>

        <HStack gap={4} mt={2} w="100%" display="flex" flexWrap="wrap" justifyContent={{ base: 'center', md: 'flex-start' }}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
          >
            <Icon as={FaGithub} mr={2} />
            GitHub
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
          >
            <Icon as={FaLinkedin} mr={2} />
            LinkedIn
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="green"
          >
            <Icon as={FaEnvelope} mr={2} />
            Contact
          </Button>
        </HStack>
      </Stack>
      
      {/* Full-size image modal */}
      {showFullImage && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          zIndex="9999"
          display="flex"
          justifyContent="center"
          alignItems="center"
          onClick={closeFullImage}
        >
          {/* Backdrop */}
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="blackAlpha.700"
            backdropFilter="blur(10px)"
          />
          
          {/* Image container */}
          <Box
            position="relative"
            maxW="90vw"
            maxH="90vh"
            zIndex="1"
            cursor="pointer"
          >
            <Image
              src={imageUrl}
              alt={`${name}'s profile picture (full size)`}
              maxW="90vw"
              maxH="85vh"
              objectFit="contain"
              borderRadius="md"
            />
            
            {/* Close button */}
            <Box
              position="absolute"
              top="2"
              right="2"
              bg="blackAlpha.600"
              color="white"
              borderRadius="full"
              w="8"
              h="8"
              display="flex"
              alignItems="center"
              justifyContent="center"
              cursor="pointer"
              onClick={(e) => {
                e.stopPropagation();
                closeFullImage();
              }}
            >
              <Icon as={FaTimes} />
            </Box>
          </Box>
        </Box>
      )}
    </Flex>
  )
} 