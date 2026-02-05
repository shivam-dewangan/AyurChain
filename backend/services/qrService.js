const QRCode = require('qrcode');

// Generate QR code as data URL (base64 image)
const generateQRCode = async (data) => {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
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
};

// Generate QR code as SVG string
const generateQRCodeSVG = async (data) => {
  try {
    const qrCodeSVG = await QRCode.toString(data, {
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
};

// Generate batch verification URL
const generateVerificationURL = (batchNumber, baseUrl) => {
  return `${baseUrl}/verify?batch=${encodeURIComponent(batchNumber)}`;
};

module.exports = {
  generateQRCode,
  generateQRCodeSVG,
  generateVerificationURL
};

