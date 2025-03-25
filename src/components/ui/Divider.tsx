import { Box } from '@chakra-ui/react'
import { useColorModeValue } from './color-mode'

interface DividerProps {
  my?: number | string;
}

export function Divider({ my = 6 }: DividerProps) {
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  return (
    <Box h="1px" bg={borderColor} my={my} />
  )
} 