import {
  Box,
  Heading,
  Text,
  Flex,
  Icon
} from '@chakra-ui/react'
import { FaQuoteLeft } from 'react-icons/fa'
import { useColorModeValue } from '../ui/color-mode'

interface SummaryProps {
  content: string;
}

export function Summary({ content }: SummaryProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const accentColor = useColorModeValue('blue.500', 'blue.300')
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  return (
    <Box>
      <Heading 
        as="h2" 
        size="md" 
        mb={4} 
        color={headingColor}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={6}
          bg={accentColor}
          mr={1}
        />
        Professional Summary
      </Heading>
      
      <Box 
        p={5}
        position="relative"
        borderRadius="md"
        bg={bgColor}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
      >
        <Icon 
          as={FaQuoteLeft} 
          color={accentColor} 
          boxSize={6} 
          opacity={0.5}
          position="absolute"
          top={3}
          left={3}
        />
        
        <Text 
          color={textColor} 
          fontSize={{ base: 'sm', md: 'md' }}
          fontStyle="italic"
          px={8}
          py={2}
          lineHeight="tall"
        >
          {content}
        </Text>
      </Box>
    </Box>
  )
} 