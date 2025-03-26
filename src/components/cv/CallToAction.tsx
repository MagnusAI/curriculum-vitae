import { Button, Flex, Icon } from '@chakra-ui/react'
import { useColorModeValue } from '../ui/color-mode'
import { FaArrowRight, FaDownload, FaEnvelope } from 'react-icons/fa'

interface CallToActionProps {
  label: string;
  onClick?: () => void;
  colorScheme?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: 'arrow' | 'download' | 'email' | 'none';
  size?: 'sm' | 'md' | 'lg';
}

export function CallToAction({
  label = 'View Full Resume',
  onClick,
  colorScheme = 'blue',
  variant = 'primary',
  icon = 'arrow',
  size = 'lg'
}: CallToActionProps) {
  const bgGradient = useColorModeValue(
    'linear(to-r, blue.400, blue.600)',
    'linear(to-r, blue.300, blue.500)'
  )

  const iconMap = {
    arrow: FaArrowRight,
    download: FaDownload,
    email: FaEnvelope,
    none: null
  }

  const IconComponent = icon !== 'none' ? iconMap[icon] : null

  return (
    <Flex justify="center">
      <Button
        colorScheme={variant === 'primary' ? undefined : colorScheme}
        size={size}
        onClick={onClick}
        bg={variant === 'primary' ? bgGradient : undefined}
        variant={variant === 'outline' ? 'outline' : variant === 'secondary' ? 'solid' : undefined}
        px={6}
        position="relative"
        overflow="hidden"
        _hover={{
          transform: 'translateY(-2px)',
          boxShadow: 'lg',
          _after: {
            transform: variant === 'primary' ? 'translateX(0)' : undefined
          }
        }}
        _active={{
          transform: 'translateY(0)',
          boxShadow: 'md'
        }}
        transition="all 0.3s ease"
        _after={variant === 'primary' ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bgGradient: 'linear(to-r, blue.500, blue.700)',
          opacity: 0,
          transform: 'translateX(-100%)',
          transition: 'transform 0.5s ease, opacity 0.3s ease',
          zIndex: -1
        } : undefined}
      >
        <Flex align="center" gap={2}>
          {label}
          {IconComponent && (
            <Icon as={IconComponent} boxSize={size === 'lg' ? 4 : 3} />
          )}
        </Flex>
      </Button>
    </Flex>
  )
} 