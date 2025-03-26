import {
  Box,
  Heading,
  Flex,
  Text,
  Stack
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'

// Define a skill category interface
interface SkillCategory {
  name: string;
  skills: string[];
  colorScheme: string;
}

interface SkillsProps {
  categories: SkillCategory[];
}

export function Skills({ categories }: SkillsProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  
  return (
    <Box>
      <Heading as="h2" size="md" mb={4} color={headingColor}>
        Core Skills
      </Heading>
      
      <Stack gap={4} width="100%">
        {categories.map((category) => (
          <Box key={category.name}>
            <Text 
              fontWeight="medium" 
              fontSize="sm" 
              mb={2}
              color={`${category.colorScheme}.500`}
            >
              {category.name}
            </Text>
            
            <Flex 
              wrap="wrap" 
              gap={2} 
              justifyContent="flex-start"
            >
              {category.skills.map((skill) => (
                <Box 
                  key={skill} 
                  bg={useColorModeValue(`${category.colorScheme}.50`, `${category.colorScheme}.900`)} 
                  color={useColorModeValue(`${category.colorScheme}.700`, `${category.colorScheme}.200`)}
                  px={3} 
                  py={1} 
                  borderRadius="md"
                  fontSize="sm"
                  fontWeight="medium"
                  borderWidth="1px"
                  borderColor={useColorModeValue(`${category.colorScheme}.200`, `${category.colorScheme}.700`)}
                >
                  {skill}
                </Box>
              ))}
            </Flex>
          </Box>
        ))}
      </Stack>
    </Box>
  )
} 