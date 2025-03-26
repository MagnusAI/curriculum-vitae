import {
  Box,
  Heading,
  Flex,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  useBreakpointValue,
  useDisclosure
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaBriefcase, FaGraduationCap, FaCalendarAlt, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useState } from 'react'

export interface TimelineItem {
  title: string;
  organization: string;
  location: string;
  period: string;
  description?: string[];
  type: 'work' | 'education';
  defaultExpanded?: boolean;
}

interface TimelineProps {
  items: TimelineItem[];
  title: string;
  type: 'work' | 'education';
}

// Individual timeline item component with expand/collapse functionality
function TimelineItemComponent({ item, index, isLast, accentColor, timelinePadding, headingColor, textColor, borderColor, bgColor, timelineMarkerOffset, timelineMarkerSize }: {
  item: TimelineItem;
  index: number;
  isLast: boolean;
  accentColor: string;
  timelinePadding: number | undefined;
  headingColor: string;
  textColor: string;
  borderColor: string;
  bgColor: string;
  timelineMarkerOffset: number | undefined;
  timelineMarkerSize: number | undefined;
}) {
  const [isExpanded, setIsExpanded] = useState(item.defaultExpanded || false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <Box 
      key={index}
      position="relative"
      borderLeft="2px solid"
      borderColor={accentColor}
      pl={timelinePadding}
      pb={isLast ? 0 : 6}
      _before={{
        content: '""',
        position: 'absolute',
        top: '0',
        left: timelineMarkerOffset,
        width: `${timelineMarkerSize}px`,
        height: `${timelineMarkerSize}px`,
        borderRadius: 'full',
        bg: accentColor,
        border: '2px solid',
        borderColor: useColorModeValue('white', 'gray.800'),
        zIndex: 1
      }}
    >
      <Box 
        bg={bgColor}
        borderRadius="md"
        borderWidth="1px"
        borderColor={isExpanded ? accentColor : borderColor}
        overflow="hidden"
        boxShadow={isExpanded ? "md" : "sm"}
        transition="all 0.2s"
        _hover={{
          boxShadow: "md",
          borderColor: accentColor,
          transform: isExpanded ? "none" : "translateY(-1px)"
        }}
        cursor="pointer"
        onClick={toggleExpand}
      >
        <Box p={{ base: isExpanded ? 3 : 2, md: isExpanded ? 4 : 3 }}>
          <Flex 
            justify="space-between" 
            flexWrap="wrap" 
            mb={item.description && isExpanded ? { base: 2, md: 3 } : 0}
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 1, sm: 0 }}
            align="center"
          >
            <Flex align="center" justify="space-between" width={{ base: '100%', sm: 'auto' }}>
              <Box>
                <Heading 
                  as="h3" 
                  size="sm" 
                  mb={1}
                  display="flex"
                  alignItems="center"
                  gap={2}
                >
                  <Icon 
                    as={item.type === 'work' ? FaBriefcase : FaGraduationCap} 
                    color={accentColor} 
                    boxSize={{ base: 3, md: 4 }} 
                  />
                  {item.title}
                </Heading>
                <Text 
                  fontWeight="medium" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  color={headingColor}
                >
                  {item.organization}
                </Text>
              </Box>
              
              {/* Desktop version shows the expand/collapse icon on the right */}
              <Icon 
                as={isExpanded ? FaChevronUp : FaChevronDown} 
                boxSize={4} 
                color={accentColor}
                display={{ base: "none", sm: "block" }}
                ml={2}
              />
            </Flex>

            <Flex align="center" justify="space-between" width={{ base: '100%', sm: 'auto' }}>
              <HStack gap={2} display={{ base: 'flex', sm: 'none' }}>
                <Icon as={FaMapMarkerAlt} color={textColor} boxSize={3} />
                <Text fontSize="sm" color={textColor}>
                  {item.location}
                </Text>
              </HStack>

              <Badge 
                colorScheme={item.type === 'work' ? 'blue' : 'purple'}
                alignSelf={{ base: 'flex-start', sm: 'flex-start' }}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                display="flex"
                alignItems="center"
                justifyContent="center"
                gap={1}
                width={{ base: 'fit-content', sm: 'auto' }}
              >
                <Icon as={FaCalendarAlt} boxSize={3} />
                {item.period}
              </Badge>
              
              {/* Mobile version shows the expand/collapse icon below */}
              <Icon 
                as={isExpanded ? FaChevronUp : FaChevronDown} 
                boxSize={4} 
                color={accentColor}
                display={{ base: "block", sm: "none" }}
              />
            </Flex>
          </Flex>
          
          {/* This is always visible on larger screens, but hidden on mobile unless expanded */}
          <Box display={{ base: 'none', sm: 'block' }}>
            <HStack gap={2} mb={isExpanded ? 3 : 0} mt={2}>
              <Icon as={FaMapMarkerAlt} color={textColor} boxSize={3} />
              <Text fontSize="sm" color={textColor}>
                {item.location}
              </Text>
            </HStack>
          </Box>
          
          {/* Collapsible description */}
          {isExpanded && item.description && (
            <Box 
              mt={3} 
              className="timeline-description" 
              opacity={isExpanded ? 1 : 0}
              transform={isExpanded ? "translateY(0)" : "translateY(-10px)"}
              transition="opacity 0.3s ease, transform 0.3s ease"
            >
              <VStack align="start" gap={2}>
                {item.description.map((desc, i) => (
                  <Flex key={i} align="flex-start" gap={2}>
                    <Text as="span" color={accentColor} mt={1.5}>•</Text>
                    <Text 
                      fontSize={{ base: 'xs', md: 'sm' }}
                      color={textColor}
                      lineHeight="tall"
                    >
                      {desc}
                    </Text>
                  </Flex>
                ))}
              </VStack>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export function Timeline({ items, title, type }: TimelineProps) {
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const bgColor = useColorModeValue('white', 'gray.800')
  const accentColor = type === 'work' 
    ? useColorModeValue('blue.500', 'blue.300')
    : useColorModeValue('purple.500', 'purple.300')
  
  // Responsive spacing adjustments
  const timelinePadding = useBreakpointValue({ base: 4, md: 6 })
  const timelineMarkerSize = useBreakpointValue({ base: 12, md: 14 })
  const timelineMarkerOffset = useBreakpointValue({ base: -6, md: -8 })

  return (
    <Box>
      <Heading 
        as="h2" 
        size="md" 
        mb={5} 
        color={headingColor}
        display="flex"
        alignItems="center"
        gap={2}
      >
        <Box
          w={1}
          h={6}
          bg={accentColor}
          mr={1}
        />
        {title}
      </Heading>
      
      <Box mb={2} fontSize="xs" color={textColor} fontStyle="italic" ml={4}>
        <Flex align="center" gap={1}>
          <Icon as={FaChevronDown} boxSize={3} />
          <Text>Click items to expand details</Text>
        </Flex>
      </Box>
      
      <VStack gap={4} align="stretch" mb={6}>
        {items.map((item, index) => (
          <TimelineItemComponent
            key={index}
            item={item}
            index={index}
            isLast={index === items.length - 1}
            accentColor={accentColor}
            timelinePadding={timelinePadding}
            headingColor={headingColor}
            textColor={textColor}
            borderColor={borderColor}
            bgColor={bgColor}
            timelineMarkerOffset={timelineMarkerOffset}
            timelineMarkerSize={timelineMarkerSize}
          />
        ))}
      </VStack>
    </Box>
  )
} 