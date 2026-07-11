import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import { education } from '../data/education';
import { hobbies } from '../data/hobbies';
import { profileData, summary } from '../data/profile';
import { gardenBeds, pottedPlants, rackTools } from '../data/skills';
import { workExperience } from '../data/work-experience';
import { TimelineItem } from '../data/types';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5,
    color: '#222222',
    paddingVertical: 42,
    paddingHorizontal: 48,
  },
  name: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#1f3a5f',
  },
  role: {
    fontSize: 12,
    color: '#555555',
    marginBottom: 2,
  },
  contact: {
    fontSize: 9,
    color: '#555555',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: '#1f3a5f',
    borderBottomWidth: 1,
    borderBottomColor: '#1f3a5f',
    paddingBottom: 2,
    marginTop: 14,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entry: {
    marginBottom: 8,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  entryTitle: {
    fontSize: 10.5,
    fontFamily: 'Helvetica-Bold',
  },
  entryPeriod: {
    fontSize: 9,
    color: '#555555',
  },
  entryOrg: {
    fontSize: 9.5,
    color: '#444444',
    marginBottom: 2,
  },
  bullet: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  bulletMark: {
    width: 10,
  },
  bulletText: {
    flex: 1,
  },
  skillCategory: {
    marginBottom: 5,
  },
  skillName: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9.5,
  },
  hobby: {
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    fontSize: 8,
    color: '#999999',
    textAlign: 'center',
  },
});

function Entry({ item }: { item: TimelineItem }) {
  return (
    <View style={styles.entry} wrap={false}>
      <View style={styles.entryHeader}>
        <Text style={styles.entryTitle}>{item.title}</Text>
        <Text style={styles.entryPeriod}>{item.period}</Text>
      </View>
      <Text style={styles.entryOrg}>
        {item.organization} — {item.location}
      </Text>
      {item.description?.map((line, i) => (
        <View style={styles.bullet} key={i}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{line}</Text>
        </View>
      ))}
    </View>
  );
}

export function CvDocument() {
  return (
    <Document
      title={`${profileData.name} — CV`}
      author={profileData.name}
      subject="Curriculum Vitae"
    >
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profileData.name}</Text>
        <Text style={styles.role}>{profileData.title}</Text>
        <Text style={styles.contact}>
          Fredensborg, Denmark · github.com/arnildtech · linkedin.com/in/magnus-arnild
        </Text>

        <Text>{summary}</Text>

        <Text style={styles.sectionTitle}>Work Experience</Text>
        {workExperience.map((item, i) => (
          <Entry item={item} key={i} />
        ))}

        <Text style={styles.sectionTitle}>Education</Text>
        {education.map((item, i) => (
          <Entry item={item} key={i} />
        ))}

        <Text style={styles.sectionTitle}>Skills</Text>
        {gardenBeds.map((bed) => (
          <View style={styles.skillCategory} key={bed.name}>
            <Text>
              <Text style={styles.skillName}>{bed.name}: </Text>
              {bed.skills.join(', ')}
            </Text>
          </View>
        ))}
        <View style={styles.skillCategory}>
          <Text>
            <Text style={styles.skillName}>Ways of working: </Text>
            {pottedPlants.map((plant) => plant.name).join(', ')}
          </Text>
        </View>
        <View style={styles.skillCategory}>
          <Text>
            <Text style={styles.skillName}>Tools: </Text>
            {rackTools.map((tool) => tool.name).join(', ')}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Hobbies</Text>
        {hobbies.map((hobby) => (
          <View style={styles.hobby} key={hobby.name}>
            <Text style={styles.skillName}>{hobby.name}</Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Generated from the interactive CV at arnildtech.github.io/curriculum-vitae
        </Text>
      </Page>
    </Document>
  );
}
