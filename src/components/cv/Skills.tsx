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
          bg={useColorModeValue('purple.500', 'purple.300')}
        />
        Professional Skills
      </Heading>
      
      <Stack 
        gap={2.5} 
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
            width="100%"
          >
            {/* Category Header */}
            <Flex 
              bg={useColorModeValue(`${category.colorScheme}.50`, `${category.colorScheme}.900`)} 
              py={1.5} 
              px={2.5} 
              borderBottom="1px"
              borderColor={borderColor}
              align="center"
              justify="space-between"
            >
              <Flex align="center" gap={1.5}>
                <Icon 
                  as={FaStar} 
                  color={useColorModeValue(`${category.colorScheme}.500`, `${category.colorScheme}.200`)} 
                  boxSize={2.5}
                />
                <Text 
                  fontWeight="bold" 
                  fontSize="xs" 
                  color={useColorModeValue(`${category.colorScheme}.700`, `${category.colorScheme}.200`)}
                >
                  {category.name}
                </Text>
              </Flex>
              
              <Badge
                fontSize="2xs"
                colorScheme={category.colorScheme}
                px={1.5}
                borderRadius="full"
              >
                {category.skills.length}
              </Badge>
            </Flex>
            
            {/* Skills List */}
            <Box py={2} px={2.5} bg={bgColor}>
              <Flex 
                wrap="wrap" 
                gap={1.5} 
                justifyContent="flex-start"
              >
                {category.skills.map((skill) => (
                  <Badge 
                    key={skill} 
                    colorScheme={category.colorScheme}
                    px={2} 
                    py={0.5} 
                    borderRadius="md"
                    fontSize="2xs"
                    fontWeight="medium"
                    variant="subtle"
                    _hover={{
                      transform: 'translateY(-1px)',
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