import {
  Flex,
  Heading,
  Text,
  Stack,
  HStack,
  Image,
  Icon,
  Button
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa'

interface ProfileProps {
  name: string;
  title: string;
  bio: string;
  imageUrl: string;
}

export function Profile({ name, title, bio, imageUrl }: ProfileProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
    <Flex
      direction={{ base: 'column', md: 'row' }}
      align={{ base: 'center', md: 'flex-start' }}
      gap={8}
    >
      <Image
        borderRadius="full"
        boxSize={{ base: '150px', md: '180px', xl: '200px' }}
        src={imageUrl}
        alt={`${name}'s profile picture`}
        border="4px solid"
        borderColor={borderColor}
      />

      <Stack align="flex-start" gap={3} w="100%" flex="1">
        <Heading as="h1" size="xl" color={headingColor}>
          {name}
        </Heading>
        <Text fontSize="xl" fontWeight="medium" color={headingColor}>
          {title}
        </Text>
        <Text color={textColor} fontSize="md">
          {bio}
        </Text>

        <HStack gap={4} mt={2} w="100%" display="flex" flexWrap="wrap" justifyContent={{ base: 'center', md: 'flex-start' }}>
          <Button
            size="sm"
            variant="outline"
            colorScheme="gray"
          >
            <Icon as={FaGithub} mr={2} />
            GitHub
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="blue"
          >
            <Icon as={FaLinkedin} mr={2} />
            LinkedIn
          </Button>
          <Button
            size="sm"
            variant="outline"
            colorScheme="green"
          >
            <Icon as={FaEnvelope} mr={2} />
            Contact
          </Button>
        </HStack>
      </Stack>
    </Flex>
  )
} 