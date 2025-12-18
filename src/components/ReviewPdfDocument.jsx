import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

// --- STYLES ---
const styles = StyleSheet.create({
  page: {
    // Top padding creates space for the fixed header
    paddingTop: 110, 
    paddingBottom: 40,
    paddingHorizontal: 30,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#333',
    lineHeight: 1.4,
  },
  header: {
    // Absolute position places it in the top padding area
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottom: '2px solid #333',
    paddingBottom: 10,
  },
  logo: {
    width: 60,           // Sized appropriately
    height: 60,          // Square aspect ratio
    objectFit: 'contain' // Prevents stretching
  },
  headerText: {
    textAlign: 'right',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
    padding: 10,
    border: '1px solid #eee',
    borderRadius: 4,
    backgroundColor: '#f9f9f9',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#222',
    borderBottom: '1px solid #ddd',
    paddingBottom: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    width: 100,
    fontWeight: 'bold',
    color: '#555',
    fontSize: 10,
  },
  value: {
    flex: 1,
    fontSize: 10,
  },
  questionRow: {
    marginBottom: 10,
    borderBottom: '1px solid #eee',
    paddingBottom: 5,
  },
  questionText: {
    marginBottom: 2,
    fontSize: 11,
    fontWeight: 'bold',
  },
  answer: {
    fontSize: 10,
  },
  flag: {
    color: '#b45309', // Dark orange for alerts
    fontSize: 9,
    marginTop: 2,
    fontStyle: 'italic',
  },
  commentsBox: {
    marginTop: 10,
    padding: 8,
    border: '1px solid #ccc',
    backgroundColor: '#fff',
    minHeight: 50,
  },
});

// --- HELPER TO FORMAT DATE ---
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return dateString.split('T')[0];
};

// --- HELPER FOR YES/NO ---
const yesNo = (val) => {
  if (val === true) return 'YES';
  if (val === false) return 'NO';
  return '-';
};

export const ReviewPdfDocument = ({ moc, review }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      
      {/* HEADER: 'fixed' makes it repeat on every page */}
      <View style={styles.header} fixed>
        <Image style={styles.logo} src="/logo.png" /> 
        <View style={styles.headerText}>
          <Text style={styles.title}>Environmental Review</Text>
          <Text style={styles.subtitle}>Stepan Air Department</Text>
          <Text style={styles.subtitle}>Generated: {new Date().toLocaleDateString()}</Text>
        </View>
      </View>

      {/* SECTION 1: MOC DETAILS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>MOC Information</Text>
        <View style={styles.row}>
          <Text style={styles.label}>MOC ID:</Text>
          <Text style={styles.value}>{moc?.["MOC ID"] || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Title:</Text>
          <Text style={styles.value}>{moc?.["Change Title"] || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Owner:</Text>
          <Text style={styles.value}>{moc?.["Change Owner"] || "N/A"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Description:</Text>
          <Text style={styles.value}>{moc?.["Change Description"] || "No description."}</Text>
        </View>
      </View>

      {/* SECTION 2: REVIEW METADATA */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Review Status</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Reviewer:</Text>
              <Text style={styles.value}>{review?.env_reviewer || "Unassigned"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Status:</Text>
              <Text style={styles.value}>{review?.env_status || "Not Reviewed"}</Text>
            </View>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.row}>
              <Text style={styles.label}>Start Date:</Text>
              <Text style={styles.value}>{formatDate(review?.env_review_start_date)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Complete Date:</Text>
              <Text style={styles.value}>{formatDate(review?.env_review_complete_date)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION 3: QUESTIONS */}
      <View style={{ marginTop: 10 }}>
        <Text style={{ ...styles.sectionTitle, borderBottom: '2px solid #000' }}>Impact Questions</Text>
        
        <View style={styles.questionRow}>
          <Text style={styles.questionText}>1. Does this project modify equipment or piping in the LDAR program?</Text>
          <Text style={styles.answer}>Answer: {yesNo(review?.modify_ldar)}</Text>
          {review?.modify_ldar && <Text style={styles.flag}>Action: Send Summary Email to LDAR Team</Text>}
        </View>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>2. Does this project modify equipment/piping relating to a control device?</Text>
          <Text style={styles.answer}>Answer: {yesNo(review?.modify_control_device)}</Text>
          {review?.modify_control_device && <Text style={styles.flag}>Action: Send Summary Email to LDAR Team</Text>}
        </View>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>3. Does this project increase product output from the process?</Text>
          <Text style={styles.answer}>Answer: {yesNo(review?.increase_process)}</Text>
          {review?.increase_process && <Text style={styles.flag}>Action: Requires updated Emission Calculations</Text>}
        </View>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>4. Does this project require an outside emission source be brought onsite?</Text>
          <Text style={styles.answer}>Answer: {yesNo(review?.require_outside_emission_source)}</Text>
          {review?.require_outside_emission_source && <Text style={styles.flag}>Action: Requires updated Emission Calculations</Text>}
        </View>

        <View style={styles.questionRow}>
          <Text style={styles.questionText}>5. Does this project require an update or new permitting?</Text>
          <Text style={styles.answer}>Answer: {yesNo(review?.permitting)}</Text>
          {review?.permitting && <Text style={styles.flag}>Action: Requires updated Permitting process.</Text>}
        </View>
      </View>

      {/* SECTION 4: COMMENTS - With wrap={false} to keep it together */}
      <View style={{ marginTop: 10 }} wrap={false}>
        <Text style={styles.sectionTitle}>General Comments</Text>
        <View style={styles.commentsBox}>
          <Text style={{ fontSize: 10 }}>{review?.comments || "No comments provided."}</Text>
        </View>
      </View>
      
    </Page>
  </Document>
);

export default ReviewPdfDocument;