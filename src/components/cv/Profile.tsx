import {
  Flex,
  Heading,
  Text,
  Stack,
  HStack,
  Image,
  Icon,
  Button,
  Box,
  Badge,
  useBreakpointValue
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaGithub, FaLinkedin, FaEnvelope, FaSearch, FaTimes, FaMapMarkerAlt } from 'react-icons/fa'
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
  
  // Responsive layout adjustments
  const imageSize = useBreakpointValue({
    base: '140px',
    sm: '160px',
    md: '180px',
    xl: '220px'
  })
  
  // Image preview state
  const [showFullImage, setShowFullImage] = useState(false)
  
  const openFullImage = () => setShowFullImage(true)
  const closeFullImage = () => setShowFullImage(false)

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'center', md: 'flex-start' }}
      gap={{ base: 6, md: 8, lg: 10 }}
    >
      {/* Profile Image Section */}
      <Box
        borderRadius="full"
        boxSize={imageSize}
        border="4px solid"
        borderColor={borderColor}
        overflow="hidden"
        flexShrink={0}
        position="relative"
        bg={bgColor}
        cursor="pointer"
        onClick={openFullImage}
        boxShadow="lg"
        _hover={{
          transform: 'scale(1.03)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: 'xl'
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
          <Icon as={FaSearch} color="white" boxSize={6} />
        </Box>
      </Box>

      {/* Profile Info Section */}
      <Stack 
        align={{ base: 'center', md: 'flex-start' }} 
        gap={{ base: 3, md: 4 }} 
        w="100%" 
        flex="1"
      >
        {/* Name & Title */}
        <Stack gap={2} align={{ base: 'center', md: 'flex-start' }}>
          <Heading 
            as="h1" 
            size={{ base: 'lg', md: 'xl', lg: '2xl' }} 
            color={headingColor}
            lineHeight="1.2"
          >
            {name}
          </Heading>
          
          <Flex 
            align={{ base: 'center', md: 'flex-start' }}
            flexDirection="column"
            gap={2} 
            wrap="wrap"
            justify={{ base: 'center', md: 'flex-start' }}
          >
            <Text 
              fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
              fontWeight="medium" 
              color={headingColor}
            >
              {title}
            </Text>
            
            <Badge 
              colorScheme="blue" 
              fontSize={{ base: 'xs', md: 'sm' }} 
              px={2} 
              py={0.5}
            >
              <Flex align="center" gap={1}>
                <Icon as={FaMapMarkerAlt} boxSize={3} />
                <Text>Fredensborg, Denmark</Text>
              </Flex>
            </Badge>
          </Flex>
        </Stack>
        
        {/* Bio */}
        <Text 
          color={textColor} 
          fontSize={{ base: 'sm', md: 'md' }}
          textAlign={{ base: 'center', md: 'left' }}
          maxW={{ base: '100%', md: '90%' }}
          lineHeight="tall"
        >
          {bio}
        </Text>

        {/* Action Buttons */}
        <HStack 
          gap={{ base: 2, md: 4 }} 
          mt={{ base: 2, md: 3 }} 
          w="100%" 
          display="flex" 
          flexWrap="wrap" 
          justifyContent={{ base: 'center', md: 'flex-start' }}
        >
          <Button
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            colorScheme="gray"
            _hover={{ bg: 'gray.50', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <Flex align="center" gap={2}>
              <Icon as={FaGithub} />
              <Text>GitHub</Text>
            </Flex>
          </Button>
          <Button
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            colorScheme="blue"
            _hover={{ bg: 'blue.50', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <Flex align="center" gap={2}>
              <Icon as={FaLinkedin} />
              <Text>LinkedIn</Text>
            </Flex>
          </Button>
          <Button
            size={{ base: 'sm', md: 'md' }}
            variant="outline"
            colorScheme="green"
            _hover={{ bg: 'green.50', transform: 'translateY(-2px)' }}
            transition="all 0.2s"
          >
            <Flex align="center" gap={2}>
              <Icon as={FaEnvelope} />
              <Text>Contact</Text>
            </Flex>
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
            borderRadius="md"
            overflow="hidden"
            boxShadow="dark-lg"
          >
            <Image
              src={imageUrl}
              alt={`${name}'s profile picture (full size)`}
              maxW="90vw"
              maxH="85vh"
              objectFit="contain"
              bg="black"
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
              _hover={{
                bg: 'blackAlpha.800'
              }}
              transition="background 0.2s"
            >
              <Icon as={FaTimes} />
            </Box>
          </Box>
        </Box>
      )}
    </Flex>
  )
} 