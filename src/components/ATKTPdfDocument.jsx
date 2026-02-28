import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

/* ================= STYLES ================= */
const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontSize: 9,
    fontFamily: "Helvetica",
  },

  box: {
    border: "1px solid #000",
    padding: 6,
  },

  header: {
    textAlign: "center",
    marginBottom: 4,
  },
  college: {
    fontSize: 11,
    fontWeight: "bold",
  },
  sub: {
    fontSize: 9,
    marginTop: 2,
  },

  row: {
    flexDirection: "row",
  },

  toSection: {
    marginTop: 6,
    borderTop: "1px solid #000",
    borderBottom: "1px solid #000",
    paddingVertical: 4,
  },

  photoBox: {
    width: 65,
    height: 80,
    border: "1px solid #000",
    justifyContent: "center",
    alignItems: "center",
  },

  nameTable: {
    border: "1px solid #000",
    marginTop: 6,
  },
  nameRow: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  nameCol: {
    flex: 1,
    borderRight: "1px solid #000",
    padding: 3,
    textAlign: "center",
  },
  nameHead: {
    fontSize: 8,
    fontWeight: "bold",
  },

  infoRow: {
    flexDirection: "row",
    marginTop: 4,
    justifyContent: "space-between",
  },

  table: {
    border: "1px solid #000",
    marginTop: 6,
  },
  tr: {
    flexDirection: "row",
    borderBottom: "1px solid #000",
  },
  th: {
    fontWeight: "bold",
    textAlign: "center",
    padding: 3,
    borderRight: "1px solid #000",
  },
  td: {
    padding: 3,
    borderRight: "1px solid #000",
    textAlign: "center",
  },

  officeBox: {
    border: "1px solid #000",
    marginTop: 6,
    padding: 4,
  },

  dashed: {
    marginVertical: 8,
    borderBottom: "1px dashed #000",
  },

  hallHeader: {
    textAlign: "center",
    marginBottom: 4,
  },

  signRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

/* ================= DOCUMENT ================= */
export default function ATKTPdfDocument({
  student,
  subjects,
  stream,
  semester,
  scheme,
  photoBase64,
  seatNo,
  signatureBase64,
  hodSignatureBase64,
  principalSignatureBase64
  ,
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.box}>
          {/* ===== HEADER ===== */}
          <View style={styles.header}>
            <Text style={styles.college}>
              MSG-SGKM COLLEGE OF ARTS, SCIENCE AND COMMERCE
            </Text>
            <Text>GHATKOPAR (E), MUMBAI - 400 077</Text>
            <Text style={styles.sub}>
              APPLICATION FOR ATKT / ADDITIONAL EXAMINATION
            </Text>
            <Text>
              BMS SEM {semester} ({scheme})
            </Text>
          </View>

          {/* ===== TO PRINCIPAL ===== */}
          <View style={[styles.row, styles.toSection]}>
            <View style={{ width: "75%" }}>
              <Text>To,</Text>
              <Text>The Principal,</Text>
              <Text>MSG-SGKM College of Arts, Science & Commerce</Text>
              <Text>
                Sir, I request permission to appear for ATKT examination.
              </Text>
            </View>

            <View>
              <View style={styles.photoBox}>
                {photoBase64 && (
                  <Image
                    src={photoBase64}
                    style={{ width: "100%", height: "100%" }}
                  />
                )}
              </View>
              <Text style={{ fontSize: 7, marginTop: 2 }}>
                Seat No: {seatNo}
              </Text>
            </View>
          </View>

          {/* ===== NAME TABLE ===== */}
          <View style={styles.nameTable}>
            <View style={styles.nameRow}>
              <Text style={styles.nameCol}>SURNAME</Text>
              <Text style={styles.nameCol}>NAME</Text>
              <Text style={styles.nameCol}>FATHER'S NAME</Text>
              <Text style={[styles.nameCol, { borderRight: 0 }]}>
                MOTHER'S NAME
              </Text>
            </View>
            <View style={styles.nameRow}>
              <Text style={styles.nameCol}>{student.surname}</Text>
              <Text style={styles.nameCol}>{student.name}</Text>
              <Text style={styles.nameCol}>{student.fatherName}</Text>
              <Text style={[styles.nameCol, { borderRight: 0 }]}>
                {student.motherName}
              </Text>
            </View>
          </View>

          {/* ===== INFO ROW ===== */}
          <View style={styles.infoRow}>
            <Text>Gender: {student.gender}</Text>
            <Text>Mobile: {student.mobile}</Text>
            <Text>Roll No: {student.rollNo}</Text>
          </View>

          {/* ===== SUBJECT TABLE ===== */}
          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, { width: "6%" }]}>Sr</Text>
              <Text style={[styles.th, { width: "46%" }]}>Subject</Text>
              <Text style={[styles.th, { width: "12%" }]}>Int</Text>
              <Text style={[styles.th, { width: "12%" }]}>Th</Text>
              <Text style={[styles.th, { width: "12%" }]}>Pr</Text>
              <Text style={[styles.th, { width: "12%", borderRight: 0 }]}>
                Remarks
              </Text>
            </View>

            {subjects.map((s, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { width: "6%" }]}>{i + 1}</Text>
                <Text style={[styles.td, { width: "46%", textAlign: "left" }]}>
                  {s.name}
                </Text>
                <Text style={[styles.td, { width: "12%" }]}>
                  {s.internal ? "YES" : "-"}
                </Text>
                <Text style={[styles.td, { width: "12%" }]}>
                  {s.theory ? "YES" : "-"}
                </Text>
                <Text style={[styles.td, { width: "12%" }]}>
                  {s.practical ? "YES" : "-"}
                </Text>
                <Text style={[styles.td, { width: "12%", borderRight: 0 }]} />
              </View>
            ))}
          </View>

          {/* ===== OFFICE USE ===== */}
          <View style={styles.officeBox}>
            <Text style={{ textAlign: "center", fontWeight: "bold" }}>
              FOR OFFICE USE ONLY
            </Text>
            <Text>Received fees Rs ______ Receipt No ______ Date ______</Text>
            <Text style={{ textAlign: "right", marginTop: 6 }}>
              Receiver's Signature
            </Text>
          </View>

          {/* ===== HALL TICKET ===== */}
          <View style={styles.dashed} />

          <View style={styles.hallHeader}>
            <Text style={styles.college}>
              MSG-SGKM COLLEGE OF ARTS, SCIENCE AND COMMERCE
            </Text>
            <Text style={{ fontWeight: "bold" }}>HALL TICKET</Text>
          </View>

          <View style={styles.row}>
            <View style={{ width: "70%" }}>
              <Text>
                Name: {student.surname} {student.name}
              </Text>
              <Text>
                Class: {stream} SEM {semester} ({scheme})
              </Text>
              <Text>Roll No: {student.rollNo}</Text>
              <Text>Seat No: {seatNo}</Text>
            </View>

            <View style={styles.photoBox}>
              {photoBase64 && (
                <Image
                  src={photoBase64}
                  style={{ width: "100%", height: "100%" }}
                />
              )}
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tr}>
              <Text style={[styles.th, { width: "58%" }]}>Subject</Text>
              <Text style={[styles.th, { width: "14%" }]}>Int</Text>
              <Text style={[styles.th, { width: "14%" }]}>Th</Text>
              <Text style={[styles.th, { width: "14%", borderRight: 0 }]}>
                Pr
              </Text>
            </View>

            {subjects.map((s, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { width: "58%", textAlign: "left" }]}>
                  {s.name}
                </Text>
                <Text style={[styles.td, { width: "14%" }]}>
                  {s.internal ? "YES" : "-"}
                </Text>
                <Text style={[styles.td, { width: "14%" }]}>
                  {s.theory ? "YES" : "-"}
                </Text>
                <Text style={[styles.td, { width: "14%", borderRight: 0 }]}>
                  {s.practical ? "YES" : "-"}
                </Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              {/* STUDENT */}
              <View style={{ width: "30%", alignItems: "center" }}>
                <View style={{ height: 50, justifyContent: "center" }}>
                  {signatureBase64 && (
                    <Image
                      src={signatureBase64}
                      style={{ maxWidth: 110, maxHeight: 40 }}
                    />
                  )}
                </View>
                <View style={{ width: "100%", borderTop: "1px solid #000" }} />
                <Text style={{ marginTop: 4, fontSize: 8 }}>
                  Student Signature
                </Text>
              </View>

              {/* HOD */}
              <View style={{ width: "30%", alignItems: "center" }}>
                <View style={{ height: 50, justifyContent: "center" }}>
                  {hodSignatureBase64 && (
                    <Image
                      src={hodSignatureBase64}
                      style={{ maxWidth: 110, maxHeight: 40 }}
                    />
                  )}
                </View>
                <View style={{ width: "100%", borderTop: "1px solid #000" }} />
                <Text style={{ marginTop: 4, fontSize: 8 }}>HOD Signature</Text>
              </View>

              {/* PRINCIPAL */}
              <View style={{ width: "30%", alignItems: "center" }}>
                <View style={{ height: 50, justifyContent: "center" }}>
                  {principalSignatureBase64 && (
                    <Image
                      src={principalSignatureBase64}
                      style={{ maxWidth: 110, maxHeight: 40 }}
                    />
                  )}
                </View>
                <View style={{ width: "100%", borderTop: "1px solid #000" }} />
                <Text style={{ marginTop: 4, fontSize: 8 }}>
                  Principal Signature
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
