import { Grid, GridItem, Box } from '@chakra-ui/react'
import { Divider } from './components/ui/Divider'
import {
  Layout,
  Profile,
  Summary,
  Skills,
  CallToAction
} from './components/cv'
import { Timeline, TimelineItem } from './components/cv/Timeline'
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

  // Work experience data
  const workExperience: TimelineItem[] = [
    {
      title: "Software Engineer",
      organization: "Kompasbank",
      location: "Denmark",
      period: "August 2023 – Present",
      description: [
        "Designed and maintained automation systems for financial services in collaboration with internal departments.",
        "Built internal tools to enhance operational efficiency.",
        "Developed and maintained banking applications with a focus on performance and scalability."
      ],
      type: "work",
      defaultExpanded: true
    },
    {
      title: "Part-time Software Engineer",
      organization: "Kompasbank",
      location: "Denmark",
      period: "April 2022 – July 2023",
      description: [
        "Developed and maintained banking applications with a focus on performance and scalability."
      ],
      type: "work"
    },
    {
      title: "Software Engineer",
      organization: "Siteimprove",
      location: "Copenhagen, Denmark",
      period: "July 2020 – April 2022",
      description: [
        "Developed internal tools to support team workflows and optimize runtime efficiency.",
        "Created client-facing applications for visualizing internal processes and service runtimes.",
        "Contributed to core product development with emphasis on maintainability and performance.",
        "Enhanced frontend user experience through design and performance improvements."
      ],
      type: "work"
    },
    {
      title: "Part-Time Software Engineer",
      organization: "Siteimprove",
      location: "Copenhagen, Denmark",
      period: "July 2019 – June 2020",
      description: [
        "Contributed to core product development with emphasis on maintainability and performance.",
        "Enhanced frontend user experience through design and performance improvements."
      ],
      type: "work"
    },
    {
      title: "IT Technician",
      organization: "Otto Suenson A/S",
      location: "Gentofte",
      period: "August 2017 – June 2019",
      description: [
        "Provided IT support and implemented infrastructure updates across departments."
      ],
      type: "work"
    },
    {
      title: "Logistics and Distribution",
      organization: "Otto Suenson A/S",
      location: "Gentofte",
      period: "August 2015 – August 2017",
      description: [
        "Coordinated logistics and managed inventory systems.",
        "Delivered orders to private customers and restaurants within the region."
      ],
      type: "work"
    }
  ]

  // Education data
  const education: TimelineItem[] = [
    {
      title: "Master of Science (MSc), Computer Science",
      organization: "IT-Universitetet i København",
      location: "Copenhagen, Denmark",
      period: "September 2021 – June 2023",
      type: "education",
      defaultExpanded: true
    },
    {
      title: "Bachelor of Science (BSc), Computer Software Engineering",
      organization: "IT-Universitetet i København",
      location: "Copenhagen, Denmark",
      period: "September 2017 – June 2020",
      type: "education"
    },
    {
      title: "Matematik A",
      organization: "Københavns VUC",
      location: "Copenhagen, Denmark",
      period: "May 2016",
      type: "education"
    },
    {
      title: "Bachelor's Degree, HA almen",
      organization: "Copenhagen Business School",
      location: "Copenhagen, Denmark",
      period: "September 2014 – August 2015",
      type: "education"
    },
    {
      title: "High School, Højere handelseksamen i Afsætning og Virksomhedsøkonomi",
      organization: "HHX Hillerød København Nord",
      location: "Hillerød, Denmark",
      period: "August 2010 – June 2013",
      type: "education"
    }
  ]

  return (
    <Layout>
      {/* Profile Section */}
      <Box mb={4}>
        <Profile {...profileData} />
      </Box>

      <Divider mb={4} />

      {/* Main Content Grid Layout */}
      <Grid
        templateColumns={{ base: "1fr", md: "1fr", lg: "3fr 1fr" }}
        gap={{ base: 4, md: 5, lg: 6 }}
        mb={6}
        width="100%"
        maxW="100%"
        overflow="hidden"
      >
        {/* Left Column: Summary and Timelines */}
        <GridItem width="100%" overflow="hidden">
          <Grid gap={{ base: 4, md: 5 }} width="100%">
            <GridItem width="100%" overflow="hidden">
              <Summary content={summary} />
            </GridItem>
            <GridItem width="100%" overflow="hidden">
              <Timeline items={workExperience} title="Work Experience" type="work" />
            </GridItem>
            <GridItem width="100%" overflow="hidden">
              <Timeline items={education} title="Education" type="education" />
            </GridItem>
          </Grid>
        </GridItem>

        {/* Right Column: Skills */}
        <GridItem width="100%" overflow="hidden">
          <Skills categories={skillCategories} />
        </GridItem>
      </Grid>

      <Divider mb={4} />

      {/* Call to Action Section */}
      <Box textAlign="center">
        <CallToAction
          label="Download Full Resume"
          icon="download"
          variant="primary"
          size="md"
        />
      </Box>
    </Layout>
  )
}

export default App
