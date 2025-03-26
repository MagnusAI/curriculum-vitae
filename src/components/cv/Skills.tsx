import {
  Box,
  Heading,
  Flex,
  Text,
  Stack,
  VStack,
  Badge,
  Icon
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaStar } from 'react-icons/fa'

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
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  
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
          bg={useColorModeValue('purple.500', 'purple.300')}
          mr={1}
        />
        Professional Skills
      </Heading>
      
      <Stack 
        gap={4} 
        width="100%" 
        align="stretch"
      >
        {categories.map((category) => (
          <Box 
            key={category.name}
            borderRadius="md"
            border="1px solid"
            borderColor={borderColor}
            overflow="hidden"
          >
            {/* Category Header */}
            <Flex 
              bg={useColorModeValue(`${category.colorScheme}.50`, `${category.colorScheme}.900`)} 
              py={2} 
              px={4} 
              borderBottom="1px"
              borderColor={borderColor}
              align="center"
              justify="space-between"
            >
              <Flex align="center" gap={2}>
                <Icon 
                  as={FaStar} 
                  color={useColorModeValue(`${category.colorScheme}.500`, `${category.colorScheme}.200`)} 
                  boxSize={3}
                />
                <Text 
                  fontWeight="bold" 
                  fontSize="sm" 
                  color={useColorModeValue(`${category.colorScheme}.700`, `${category.colorScheme}.200`)}
                >
                  {category.name}
                </Text>
              </Flex>
              
              <Badge
                fontSize="xs"
                colorScheme={category.colorScheme}
                px={2}
                borderRadius="full"
              >
                {category.skills.length}
              </Badge>
            </Flex>
            
            {/* Skills List */}
            <Box py={3} px={4} bg={bgColor}>
              <Flex 
                wrap="wrap" 
                gap={2} 
                justifyContent="flex-start"
              >
                {category.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    colorScheme={category.colorScheme}
                    px={3} 
                    py={1} 
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="medium"
                    variant="subtle"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'sm',
                      transition: 'all 0.2s ease'
                    }}
                    transition="all 0.2s ease"
                  >
                    {skill}
                  </Badge>
                ))}
              </Flex>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  )
} 