import { useState } from 'react';

// Lazy-loads the PDF module (and @react-pdf/renderer with it) only when
// the user actually asks for the download.
export function useDownloadPdf() {
  const [busy, setBusy] = useState(false);
  const download = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const mod = await import('../pdf/downloadPdf');
      await mod.downloadCvPdf();
    } catch (err) {
      console.error('PDF download failed', err);
      alert('Sorry — generating the PDF failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };
  return { busy, download };
}
