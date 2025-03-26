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
  Grid,
  GridItem
} from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaBriefcase, FaGraduationCap, FaCalendarAlt, FaMapMarkerAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useState } from 'react'
import React from 'react'

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

  // Height of timeline marker
  const markerSize = timelineMarkerSize || 8;

  return (
    <Box 
      position="relative"
      borderLeft="2px solid"
      borderColor={accentColor}
      pl={timelinePadding}
      pb={isLast ? 0 : 2}
      _before={{
        content: '""',
        position: 'absolute',
        top: '0',
        left: timelineMarkerOffset,
        width: `${markerSize}px`,
        height: `${markerSize}px`,
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
        boxShadow="sm"
        transition="all 0.2s"
        _hover={{
          borderColor: accentColor
        }}
        cursor="pointer"
        onClick={toggleExpand}
        width="100%"
        maxW="100%"
      >
        <Box py={1.5} px={2}>
          {/* Main header - always visible */}
          <Flex direction="column" gap={0.5}>
            {/* Title */}
            <Flex 
              justify="space-between" 
              align="center"
              w="full"
            >
              <Text 
                fontWeight="bold" 
                fontSize="sm" 
                color={headingColor}
                maxW="70%"
                textOverflow="ellipsis" 
                overflow="hidden" 
                whiteSpace="nowrap"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Icon 
                  as={item.type === 'work' ? FaBriefcase : FaGraduationCap} 
                  color={accentColor} 
                  boxSize={2.5}
                  flexShrink={0}
                />
                {item.title}
              </Text>
              
              <Flex align="center" gap={1.5}>
                <Text fontSize="xs" color={textColor} fontWeight="medium">
                  {item.period}
                </Text>
                <Icon 
                  as={isExpanded ? FaChevronUp : FaChevronDown} 
                  boxSize={3} 
                  color={accentColor}
                />
              </Flex>
            </Flex>
            
            {/* Organization & Location */}
            <Flex 
              justify="space-between" 
              align="center"
              w="full"
            >
              <Text 
                fontSize="xs"
                color={headingColor}
                maxW="60%"
                textOverflow="ellipsis" 
                overflow="hidden" 
                whiteSpace="nowrap"
              >
                {item.organization}
              </Text>
              
              <Flex align="center" gap={1}>
                <Icon as={FaMapMarkerAlt} color={textColor} boxSize={2} />
                <Text fontSize="xs" color={textColor}>
                  {item.location}
                </Text>
              </Flex>
            </Flex>
          </Flex>
          
          {/* Expandable content */}
          {isExpanded && item.description && (
            <Box 
              mt={2}
              pt={1.5}
              borderTopWidth="1px"
              borderTopColor={borderColor}
            >
              <VStack align="stretch" gap={1}>
                {item.description.map((desc, i) => (
                  <Flex key={i} align="flex-start" gap={1.5}>
                    <Text as="span" color={accentColor} fontSize="xs" lineHeight="tall" mt={0.5}>•</Text>
                    <Text 
                      fontSize="xs"
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
  
  // Responsive spacing adjustments - extra compact
  const timelinePadding = useBreakpointValue({ base: 2.5, md: 4 })
  const timelineMarkerSize = useBreakpointValue({ base: 6, md: 8 })
  const timelineMarkerOffset = useBreakpointValue({ base: -3, md: -4 })

  return (
    <Box>
      <Heading 
        as="h2" 
        size="sm"
        mb={1.5}
        color={headingColor}
        display="flex"
        alignItems="center"
        gap={1.5}
      >
        <Box
          w={1}
          h={4}
          bg={accentColor}
        />
        {title}
      </Heading>
      
      <Box mb={1} fontSize="xs" color={textColor} fontStyle="italic" ml={1}>
        <Flex align="center" gap={1}>
          <Icon as={FaChevronDown} boxSize={2} />
          <Text fontSize="xs">Click items to expand</Text>
        </Flex>
      </Box>
      
      <VStack gap={1.5} align="stretch" mb={4}>
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