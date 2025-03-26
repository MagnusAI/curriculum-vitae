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
    <Box width="100%" overflow="hidden">
      <Heading 
        as="h2" 
        size="sm" 
        mb={3} 
        color={headingColor}
        display="flex"
        alignItems="center"
        gap={1.5}
      >
        <Box
          w={1}
          h={4}
          bg={accentColor}
        />
        Professional Summary
      </Heading>
      
      <Box 
        p={{ base: 3, md: 4 }}
        position="relative"
        borderRadius="md"
        bg={bgColor}
        boxShadow="sm"
        border="1px solid"
        borderColor={borderColor}
        width="100%"
      >
        <Icon 
          as={FaQuoteLeft} 
          color={accentColor} 
          boxSize={{ base: 4, md: 5 }} 
          opacity={0.5}
          position="absolute"
          top={3}
          left={3}
        />
        
        <Text 
          color={textColor} 
          fontSize={{ base: 'xs', md: 'sm' }}
          fontStyle="italic"
          pl={{ base: 6, md: 7 }}
          pr={{ base: 3, md: 4 }}
          lineHeight="tall"
        >
          {content}
        </Text>
      </Box>
    </Box>
  )
} 