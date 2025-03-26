import {
  Box,
  Heading,
  Text,
  Grid,
  GridItem,
  Flex,
  Badge,
  Icon,
  Link
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaExternalLinkAlt, FaCode, FaBriefcase } from 'react-icons/fa'

interface Project {
  title: string;
  description: string;
  techStack?: string[];
  link?: string;
}

interface ProjectsProps {
  projects: Project[];
}

export function Projects({ projects }: ProjectsProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgColor = useColorModeValue('white', 'gray.800')
  const hoverBgColor = useColorModeValue('gray.50', 'gray.700')

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
          bg={useColorModeValue('green.500', 'green.300')}
          mr={1}
        />
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
            <Box
              p={4}
              borderWidth="1px"
              borderRadius="md"
              borderColor={borderColor}
              h="100%"
              bg={bgColor}
              transition="all 0.2s ease"
              _hover={{
                transform: 'translateY(-4px)',
                boxShadow: 'md',
                bg: hoverBgColor,
                borderColor: useColorModeValue('blue.200', 'blue.500')
              }}
            >
              <Flex justify="space-between" align="flex-start" mb={2}>
                <Heading
                  as="h3"
                  size="sm"
                  mb={2}
                  color={headingColor}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon as={FaBriefcase} color="green.500" boxSize={4} />
                  {project.title}
                </Heading>

                {project.link && (
                  <Link
                    href={project.link}
                    color="blue.500"
                    _hover={{ color: 'blue.600' }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon as={FaExternalLinkAlt} boxSize={4} />
                  </Link>
                )}
              </Flex>

              <Text
                color={textColor}
                fontSize="sm"
                mb={4}
                lineHeight="tall"
              >
                {project.description}
              </Text>

              {project.techStack && (
                <Flex mt={3} flexWrap="wrap" gap={2}>
                  {project.techStack.map((tech, techIndex) => (
                    <Badge
                      key={techIndex}
                      colorScheme="gray"
                      variant="subtle"
                      fontSize="xs"
                      px={2}
                      py={0.5}
                      borderRadius="md"
                      display="flex"
                      alignItems="center"
                      gap={1}
                    >
                      <Icon as={FaCode} boxSize={2.5} />
                      {tech}
                    </Badge>
                  ))}
                </Flex>
              )}
            </Box>
          </GridItem>
        ))}
      </Grid>
    </Box>
  )
} 