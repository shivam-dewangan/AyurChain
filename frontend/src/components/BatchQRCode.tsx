import React from 'react';

interface BatchQRCodeProps {
  batchNumber: string;
  herbName: string;
  showInline?: boolean;
}

const BatchQRCode: React.FC<BatchQRCodeProps> = ({ batchNumber, herbName, showInline }) => {
  return (
    <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center text-xs">
      QR
    </div>
  );
};

export default BatchQRCode;
