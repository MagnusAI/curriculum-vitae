import { 
  Box, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Stack,
  HStack,
  Image, 
  Icon,
  Button 
} from '@chakra-ui/react'
import { ColorModeButton, useColorModeValue } from './components/ui/color-mode'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

function App() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container maxW="container.lg">
        {/* Header with Dark Mode Toggle */}
        <Flex justifyContent="flex-end" mb={4}>
          <ColorModeButton />
        </Flex>
        
        {/* Main Card */}
        <Box 
          bg={cardBgColor} 
          borderRadius="lg" 
          boxShadow="md" 
          p={{ base: 6, md: 8 }}
          border="1px"
          borderColor={borderColor}
        >
          {/* Profile Section */}
          <Flex 
            direction={{ base: 'column', md: 'row' }} 
            align={{ base: 'center', md: 'flex-start' }}
            gap={8}
          >
            <Image
              borderRadius="full"
              boxSize={{ base: '150px', md: '180px' }}
              src="https://placehold.co/400x400?text=Profile"
              alt="Profile"
              border="4px solid"
              borderColor={borderColor}
            />
            
            <Stack align="flex-start" gap={3} flex="1">
              <Heading as="h1" size="xl" color={headingColor}>
                John Doe
              </Heading>
              <Text fontSize="xl" fontWeight="medium" color={headingColor}>
                Full Stack Developer
              </Text>
              <Text color={textColor} fontSize="md">
                Passionate developer with over 5 years of experience building web applications.
                Specialized in React, TypeScript, and modern web technologies.
              </Text>
              
              <HStack gap={4} mt={2}>
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
          </Flex>
          
          <Box h="1px" bg={borderColor} my={6} />
          
          {/* Summary Section */}
          <Stack gap={6} align="stretch">
            <Box>
              <Heading as="h2" size="md" mb={4} color={headingColor}>
                Professional Summary
              </Heading>
              <Text color={textColor}>
                Experienced software engineer with a strong foundation in full-stack development.
                Proven track record of delivering high-quality web applications using modern frameworks.
                Adept at collaborating in agile teams and committed to clean, maintainable code.
              </Text>
            </Box>
            
            <Box>
              <Heading as="h2" size="md" mb={4} color={headingColor}>
                Core Skills
              </Heading>
              <Flex wrap="wrap" gap={2}>
                {['React', 'TypeScript', 'Node.js', 'Express', 'MongoDB', 'GraphQL', 'Next.js', 'Chakra UI', 'Git'].map((skill) => (
                  <Box 
                    key={skill} 
                    bg={useColorModeValue('gray.100', 'gray.700')} 
                    color={headingColor}
                    px={3} 
                    py={1} 
                    borderRadius="md"
                    fontSize="sm"
                    fontWeight="medium"
                  >
                    {skill}
                  </Box>
                ))}
              </Flex>
            </Box>
            
            <Box>
              <Heading as="h2" size="md" mb={4} color={headingColor}>
                Featured Projects
              </Heading>
              <Stack gap={4} align="stretch">
                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                  <Heading as="h3" size="sm" mb={2} color={headingColor}>
                    E-commerce Platform
                  </Heading>
                  <Text color={textColor} fontSize="sm">
                    A full-featured online store built with React and Node.js, featuring user authentication,
                    product catalog, shopping cart, and payment processing.
                  </Text>
                </Box>
                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                  <Heading as="h3" size="sm" mb={2} color={headingColor}>
                    Task Management App
                  </Heading>
                  <Text color={textColor} fontSize="sm">
                    A productivity tool designed to help users organize tasks, set priorities,
                    and track progress using drag-and-drop features and real-time updates.
                  </Text>
                </Box>
              </Stack>
            </Box>
          </Stack>
          
          <Box h="1px" bg={borderColor} my={6} />
          
          {/* Footer with Call to Action */}
          <Flex justify="center">
            <Button colorScheme="blue" size="lg">
              View Full Resume
            </Button>
          </Flex>
        </Box>
        
        <Text textAlign="center" fontSize="sm" color={textColor} mt={6}>
          © {new Date().getFullYear()} John Doe - Built with React and Chakra UI
        </Text>
      </Container>
    </Box>
  )
}

export default App
