import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'

interface Project {
  title: string;
  description: string;
}

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  
  return (
    <Box>
      <Heading as="h2" size="md" mb={4} color={headingColor}>
        Featured Projects
      </Heading>
      <Grid 
        templateColumns={{ 
          base: "1fr", 
          xl: "1fr 1fr" 
        }}
        gap={4}
      >
        {projects.map((project, index) => (
          <GridItem key={index}>
            <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} h="100%">
              <Heading as="h3" size="sm" mb={2} color={headingColor}>
                {project.title}
              </Heading>
              <Text color={textColor} fontSize="sm">
                {project.description}
              </Text>
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  )
} 