import { useMemo, useRef } from 'react';
import type { RaceResult } from '../../shared/types';
import { BrandLogo } from '../../shared/components';
import styles from './CertificateModal.module.css';

interface CertificateModalProps {
  runner: RaceResult;
  coverImage?: string;
  onClose: () => void;
}

export const CertificateModal = ({ runner, coverImage, onClose }: CertificateModalProps) => {
  const certificateRef = useRef<HTMLDivElement>(null);

  const generatedDate = useMemo(
    () => new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' }),
    [],
  );

  const createCanvas = async () => {
    if (!certificateRef.current) return null;

    const html2canvasModule = await import('html2canvas');
    const html2canvas = html2canvasModule.default;

    return html2canvas(certificateRef.current, {
      scale: 2,
      backgroundColor: '#ffffff',
      useCORS: true,
    });
  };

  const handleDownloadPNG = async () => {
    const canvas = await createCanvas();
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificado-${runner.dorsal}.png`;
    link.click();
  };

  const handleDownloadPDF = async () => {
    const canvas = await createCanvas();
    if (!canvas) return;

    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;

    const imageData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const imageWidth = canvas.width * ratio;
    const imageHeight = canvas.height * ratio;
    const marginX = (pageWidth - imageWidth) / 2;
    const marginY = (pageHeight - imageHeight) / 2;

    pdf.addImage(imageData, 'PNG', marginX, marginY, imageWidth, imageHeight);
    pdf.save(`certificado-${runner.dorsal}.pdf`);
  };

  return (
    <div className={styles.backdrop} role="dialog" aria-modal="true" aria-label="Certificado de corredor">
      <div className={styles.modal}>
        <div className={styles.actionsTop}>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Cerrar
          </button>
        </div>

        <div
          ref={certificateRef}
          className={styles.certificate}
          style={{ backgroundImage: `linear-gradient(125deg, rgba(0,0,0,0.82), rgba(0,0,0,0.58)), url('${coverImage || '/images/results-running.jpg'}')` }}
        >
          <div className={styles.overlay}></div>
          <div className={styles.content}>
            <BrandLogo variant="badge" className={styles.certificateLogo} />
            <p className={styles.kicker}>Certificado Oficial</p>
            <h2>BipTime</h2>
            <p className={styles.subtitle}>Se certifica que</p>
            <h3>{runner.nombreCompleto}</h3>
            <p className={styles.subtitle}>completó la prueba {runner.distancia}</p>

            <div className={styles.metrics}>
              <div>
                <span>Dorsal</span>
                <strong>#{runner.dorsal}</strong>
              </div>
              <div>
                <span>Tiempo Neto</span>
                <strong>{runner.netTime || '—'}</strong>
              </div>
              <div>
                <span>Pos. General / Categoría</span>
                <strong>{runner.posicionGeneral}° / {runner.posicionCategoria}°</strong>
              </div>
              <div>
                <span>Categoría</span>
                <strong>{runner.categoria}</strong>
              </div>
            </div>

            <div className={styles.footerLine}>
              <span>Emitido el {generatedDate}</span>
              <span>Status: {runner.status}</span>
            </div>
          </div>
        </div>

        <div className={styles.actionsBottom}>
          <button type="button" className={styles.downloadBtn} onClick={handleDownloadPNG}>
            Descargar PNG
          </button>
          <button type="button" className={styles.downloadBtn} onClick={handleDownloadPDF}>
            Descargar PDF
          </button>
        </div>
      </div>
    </div>
  );
};
