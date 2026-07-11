import { createElement } from 'react';
import { pdf } from '@react-pdf/renderer';
import { CvDocument } from './CvDocument';

// Renders the CV to a PDF blob in the browser and triggers a download.
// This module is loaded via dynamic import so @react-pdf/renderer stays
// out of the main bundle.
export async function downloadCvPdf(): Promise<void> {
  const blob = await pdf(createElement(CvDocument)).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'magnus-arnild-cv.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
