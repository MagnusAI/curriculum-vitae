import { Box } from '@chakra-ui/react'
import { useColorModeValue } from './color-mode'

interface DividerProps {
  my?: number | string;
  mb?: number | string;
}

export function Divider({ my = 6, mb }: DividerProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  return (
    <Box 
      h="1px" 
      bg={borderColor} 
      my={mb ? undefined : my} 
      mb={mb} 
    />
  )
} 