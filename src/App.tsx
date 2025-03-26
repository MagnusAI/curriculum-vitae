import { Grid, GridItem, Box, Container } from '@chakra-ui/react'
import { Divider } from './components/ui/Divider'
import {
  Layout,
  Profile,
  Summary,
  Skills,
  Projects,
  CallToAction
} from './components/cv'
import './App.css'
import profileImage from './assets/profile_image.png'

function App() {
  // Profile data
  const profileData = {
    name: "Magnus Arnild",
    title: "Software Engineer",
    bio: "Passionate Software Engineer with a focus on building scalable cloud-native applications for financial services.",
    imageUrl: profileImage
  }

  // Skills data organized by categories
  const skillCategories = [
    {
      name: "Languages & Frameworks",
      skills: ['Java', 'TypeScript', 'Node.js', 'Kotlin', 'C#', 'Python', 'React', 'Next.js'],
      colorScheme: "blue"
    },
    {
      name: "Architecture & Design",
      skills: ['Infrastructure as Code', 'Hexagonal Architecture', 'Domain Driven Design', 'Microservices'],
      colorScheme: "purple"
    },
    {
      name: "Cloud & Tooling",
      skills: ['AWS Cloud Services', 'Docker', 'OpsGenie', 'Git', 'Contentful (CMS)', 'Sanity (CMS)'],
      colorScheme: "teal"
    },
    {
      name: "Development Practices",
      skills: ['Fullstack Development', 'Frontend Development', 'Backend Development', 'Agile Methodologies', 'CI/CD', 'Scrum', 'Kanban'],
      colorScheme: "green"
    },
    {
      name: "Testing & Tooling",
      skills: ['JUnit', 'Cypress', 'Jest', 'Storybook', 'Jira'],
      colorScheme: "orange"
    }
  ]

  // Summary data
  const summary = "Software Engineer with experience in financial services and fullstack development. Skilled in building scalable, cloud-native applications using modern technologies such as Java, TypeScript, and AWS. Adept in both frontend and backend development"

  // Projects data
  const projects = [
    {
      title: "E-commerce Platform",
      description: "A full-featured online store built with React and Node.js, featuring user authentication, product catalog, shopping cart, and payment processing.",
      techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'Stripe']
    },
    {
      title: "Task Management App",
      description: "A productivity tool designed to help users organize tasks, set priorities, and track progress using drag-and-drop features and real-time updates.",
      techStack: ['TypeScript', 'React', 'Firebase', 'Material UI']
    },
    {
      title: "Financial Dashboard",
      description: "An interactive dashboard for visualizing financial data with custom charts, filters, and exports. Integrates with multiple financial APIs.",
      techStack: ['React', 'D3.js', 'Redux', 'Node.js', 'PostgreSQL']
    },
    {
      title: "Mobile Fitness Tracker",
      description: "A cross-platform mobile app that tracks workouts, nutrition, and progress with personalized recommendations and social features.",
      techStack: ['React Native', 'GraphQL', 'AWS Amplify', 'Expo']
    }
  ]

  return (
    <Layout>
      {/* Profile Section */}
      <Box mb={8}>
        <Profile {...profileData} />
      </Box>

      <Divider mb={8} />
      
      {/* Main Content Grid Layout */}
      <Grid 
        templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
        gap={{ base: 8, lg: 10 }}
        mb={8}
      >
        {/* Left Column: Summary and Projects */}
        <GridItem>
          <Grid gap={8}>
            <GridItem>
              <Summary content={summary} />
            </GridItem>
            <GridItem>
              <Projects projects={projects} />
            </GridItem>
          </Grid>
        </GridItem>
        
        {/* Right Column: Skills */}
        <GridItem>
          <Skills categories={skillCategories} />
        </GridItem>
      </Grid>

      <Divider mb={8} />

      {/* Call to Action Section */}
      <Box textAlign="center">
        <CallToAction 
          label="Download Full Resume" 
          icon="download"
          variant="primary"
          size="lg"
        />
      </Box>
    </Layout>
  )
}

export default App
