import { Grid, GridItem, Box, Flex } from '@chakra-ui/react'
import { Divider } from './components/ui/Divider'
import {
  Layout,
  Profile,
  Summary,
  Skills,
  CallToAction
} from './components/cv'
import { Timeline } from './components/cv/Timeline'
import './App.css'
import { education } from './data/education'
import { profileData, summary } from './data/profile'
import { workExperience } from './data/work-experience'
import { skillCategories } from './data/skills'

function App() {
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
              <Flex gap={{ base: 6, md: 8 }} flexDirection={{ base: 'column', md: 'row' }} overflow="hidden">
                <Box width={{ base: "100%", md: "50%" }}>
                  <Timeline items={workExperience} title="Work Experience" type="work" />
                </Box>
                <Box width={{ base: "100%", md: "50%" }}>
                  <Timeline items={education} title="Education" type="education" />
                </Box>
              </Flex>
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
