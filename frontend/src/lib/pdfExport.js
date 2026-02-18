import jsPDF from 'jspdf';

export const exportSalesHistoryToPDF = (purchases, farmerName) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text('AyurChain - Sales History Report', 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Farmer: ${farmerName}`, 20, 35);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
  
  // Summary
  const totalSales = purchases.reduce((sum, p) => sum + p.total_amount, 0);
  const totalEarnings = purchases.reduce((sum, p) => sum + p.farmer_amount, 0);
  
  doc.text(`Total Sales: ₹${totalSales.toFixed(2)}`, 20, 60);
  doc.text(`Total Earnings: ₹${totalEarnings.toFixed(2)}`, 20, 70);
  doc.text(`Total Transactions: ${purchases.length}`, 20, 80);
  
  // Table headers
  let yPos = 100;
  doc.setFontSize(10);
  doc.text('Date', 20, yPos);
  doc.text('Batch', 50, yPos);
  doc.text('Herb', 80, yPos);
  doc.text('Qty(kg)', 110, yPos);
  doc.text('Amount', 140, yPos);
  doc.text('Earnings', 170, yPos);
  
  // Table data
  yPos += 10;
  purchases.forEach((purchase) => {
    if (yPos > 270) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.text(new Date(purchase.purchase_date).toLocaleDateString(), 20, yPos);
    doc.text(purchase.batch_number.slice(-8), 50, yPos);
    doc.text(purchase.herb_name, 80, yPos);
    doc.text(purchase.quantity_kg.toString(), 110, yPos);
    doc.text(`₹${purchase.total_amount}`, 140, yPos);
    doc.text(`₹${purchase.farmer_amount}`, 170, yPos);
    
    yPos += 8;
  });
  
  // Save
  doc.save(`ayurchain-sales-${new Date().toISOString().split('T')[0]}.pdf`);
};

