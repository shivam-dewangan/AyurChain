// QR Service - Client side for generating and handling QR codes
import QRCode from 'qrcode';

export class QRCodeService {
  
  // Generate QR code URL for batch verification
  generateBatchVerificationURL(batchNumber) {
    const baseURL = window.location.origin;
    return `${baseURL}/verify?batch=${encodeURIComponent(batchNumber)}`;
  }

  // Generate QR code as data URL (base64 image)
  async generateQRCode(batchNumber) {
    try {
      const verificationURL = this.generateBatchVerificationURL(batchNumber);
      
      const qrCodeDataURL = await QRCode.toDataURL(verificationURL, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      return qrCodeDataURL;
    } catch (error) {
      console.error('QR code generation failed:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  // Generate QR code as SVG string
  async generateQRCodeSVG(batchNumber) {
    try {
      const verificationURL = this.generateBatchVerificationURL(batchNumber);
      
      const qrCodeSVG = await QRCode.toString(verificationURL, {
        type: 'svg',
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });
      
      return qrCodeSVG;
    } catch (error) {
      console.error('QR code SVG generation failed:', error);
      throw new Error('Failed to generate QR code SVG');
    }
  }

  // Download QR code as PNG file
  downloadQRCode(batchNumber, qrCodeDataURL) {
    const link = document.createElement('a');
    link.download = `QR_${batchNumber}.png`;
    link.href = qrCodeDataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Print QR code
  printQRCode(batchNumber, qrCodeDataURL) {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - ${batchNumber}</title>
            <style>
              body { 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0; 
                font-family: Arial, sans-serif;
              }
              .qr-container {
                text-align: center;
                padding: 20px;
                border: 2px solid #000;
                border-radius: 10px;
              }
              .batch-info {
                margin-bottom: 20px;
                font-size: 18px;
                font-weight: bold;
              }
              .qr-code {
                margin: 20px 0;
              }
              .instructions {
                margin-top: 20px;
                font-size: 14px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <div class="batch-info">AyurChain Batch: ${batchNumber}</div>
              <div class="qr-code">
                <img src="${qrCodeDataURL}" alt="QR Code" />
              </div>
              <div class="instructions">
                Scan this QR code to verify batch authenticity<br>
                and view complete traceability information
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  }
}

export const qrService = new QRCodeService();

