import { pdf } from '@react-pdf/renderer';
import ATKTPdfDocument from '../components/ATKTPdfDocument';

export const generateATKTPdf = async (data) => {
  try {
    // React component ko render karke Blob banata hai
    // 'data' object me saari cheezein honi chahiye (student, subjects, stream, etc.)
    const blob = await pdf(
  <ATKTPdfDocument
    student={data.student}
    subjects={data.subjects}
    stream={data.stream}
    semester={data.semester}
    scheme={data.scheme}
    photoBase64={data.photoBase64}
    seatNo={data.seatNo}
    signatureBase64={data.signatureBase64}
    hodSignatureBase64={data.hodSignatureBase64}
    principalSignatureBase64={data.principalSignatureBase64}
  />
).toBlob();
return blob;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
};