import {
  Box,
  Container,
  Flex,
  Text
} from '@chakra-ui/react'
import { ColorModeButton, useColorModeValue } from '../ui/color-mode'
import { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  return (
    <Box bg={bgColor} minH="100vh" py={10}>
      <Container
        maxW={{ 
          base: "container.sm", 
          md: "container.md", 
          lg: "container.lg",
          xl: "container.xl", 
          "2xl": "8xl" 
        }} 
        px={{ base: 4, md: 6, lg: 8 }}
      >
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
          mx="auto"
          w="100%"
        >
          {children}
        </Box>
        
        <Text textAlign="center" fontSize="sm" color={textColor} mt={6}>
          © {new Date().getFullYear()} John Doe - Built with React and Chakra UI
        </Text>
      </Container>
    </Box>
  )
} 