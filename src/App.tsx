import { Grid, GridItem } from '@chakra-ui/react'
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

function App() {
  // Profile data
  const profileData = {
    name: "John Doe",
    title: "Full Stack Developer",
    bio: "Passionate developer with over 5 years of experience building web applications. Specialized in React, TypeScript, and modern web technologies.",
    imageUrl: "https://placehold.co/400x400?text=Profile"
  }

  // Skills data
  const skills = [
    'Java', 'TypeScript', 'Node.js', 'Kotlin',
    'C#', 'Python', 'Nextjs', 'Infrastructure as Code', 'Git', 'AWS Cloud Services', 'Docker', 'Domain Driven Design', 'Microservices', 'Fullstack', 'Agile Methodologies', 'Cypress', 'JUnit', 'Jest', 'Storybook', 'Contentful (CMS)', 'Sanity (CMS)', 'OpsGenie', 'Jira', 'Hexagonal Architecture'
  ]

  // Summary data
  const summary = "Experienced software engineer with a strong foundation in full-stack development. Proven track record of delivering high-quality web applications using modern frameworks. Adept at collaborating in agile teams and committed to clean, maintainable code."

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

      {/* Summary Section - Grid Layout for widescreen displays */}
      <Grid
        templateColumns={{
          base: "1fr",
          lg: "1fr 1fr",
          xl: "1fr 1fr 1fr"
        }}
        gap={{ base: 6, lg: 8 }}
      >
        <GridItem colSpan={{ base: 1, xl: 3 }}>
          <Summary content={summary} />
        </GridItem>

        <GridItem>
          <Skills skills={skills} />
        </GridItem>

        <GridItem colSpan={{ base: 1, lg: 1, xl: 2 }}>
          <Projects projects={projects} />
        </GridItem>
      </Grid>

      <Divider />

      {/* Footer with Call to Action */}
      <CallToAction label="View Full Resume" />
    </Layout>
  )
}

export default App
