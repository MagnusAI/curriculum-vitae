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
    <Box bg={bgColor} minH="100vh" py={6}>
      <Container
        maxW={{
          base: "100%",
          sm: "100%",
          md: "container.md",
          lg: "container.lg",
          xl: "container.xl",
          "2xl": "8xl"
        }}
        px={{ base: 2, sm: 4, md: 6, lg: 8 }}
      >
        {/* Header with Dark Mode Toggle */}
        <Flex justifyContent="flex-end" mb={3}>
          <ColorModeButton />
        </Flex>

        {/* Main Card */}
        <Box
          bg={cardBgColor}
          borderRadius="lg"
          boxShadow="md"
          p={{ base: 3, sm: 4, md: 6, lg: 8 }}
          border="1px"
          borderColor={borderColor}
          mx="auto"
          w="100%"
          overflow="hidden"
        >
          {children}
        </Box>

        <Text textAlign="center" fontSize="xs" color={textColor} mt={4}>
          © {new Date().getFullYear()} Magnus Arnild - Built with React and Chakra UI
        </Text>
      </Container>
    </Box>
  )
} 