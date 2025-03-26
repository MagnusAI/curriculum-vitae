import { Stack } from '@chakra-ui/react'
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
      description: "A full-featured online store built with React and Node.js, featuring user authentication, product catalog, shopping cart, and payment processing."
    },
    {
      title: "Task Management App",
      description: "A productivity tool designed to help users organize tasks, set priorities, and track progress using drag-and-drop features and real-time updates."
    }
  ]

  return (
    <Layout>
      {/* Profile Section */}
      <Profile {...profileData} />

      <Divider />

      {/* Content sections */}
      <Stack gap={6}>
        <Summary content={summary} />
        <Skills categories={skillCategories} />
        <Projects projects={projects} />
      </Stack>

      <Divider />

      {/* Footer with Call to Action */}
      <CallToAction label="View Full Resume" />
    </Layout>
  )
}

export default App
