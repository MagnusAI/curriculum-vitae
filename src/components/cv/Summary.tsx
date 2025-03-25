import {
  Box,
  Heading,
  Text
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'

interface SummaryProps {
  content: string;
}

export function Summary({ content }: SummaryProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  
  return (
    <Box>
      <Heading as="h2" size="md" mb={4} color={headingColor}>
        Professional Summary
      </Heading>
      <Text color={textColor}>
        {content}
      </Text>
    </Box>
  )
} 