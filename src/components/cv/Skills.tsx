import {
  Box,
  Heading,
  Flex,
  Text
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'

interface SkillsProps {
  skills: string[];
}

export function Skills({ skills }: SkillsProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  
  return (
    <Box display="flex" flexDirection="column" justifyContent={{ base: 'center', lg: 'flex-start' }} placeItems="center">
      <Heading as="h2" size="md" mb={4} color={headingColor}>
        Core Skills
      </Heading>
      <Flex wrap="wrap" gap={2} justifyContent={{ base: 'center', lg: 'flex-start' }} placeItems="center" maxW="540px">
        {skills.map((skill) => (
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
  )
} 