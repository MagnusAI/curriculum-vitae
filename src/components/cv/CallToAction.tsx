import { Button, Flex } from '@chakra-ui/react'

interface CallToActionProps {
  label: string;
  onClick?: () => void;
  colorScheme?: string;
}

export function CallToAction({
  label = 'View Full Resume',
  onClick,
  colorScheme = 'blue'
}: CallToActionProps) {
  return (
    <Flex justify="center">
      <Button 
        colorScheme={colorScheme} 
        size="lg"
        onClick={onClick}
      >
        {label}
      </Button>
    </Flex>
  )
} 