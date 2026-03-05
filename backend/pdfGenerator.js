import PDFDocument from 'pdfkit';

export const generateMonthlyRecordsPDF = (user, records, res) => {
  // Sets necessary API HTTP headers for PDF streaming
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=Timesheet_${user.name.replace(/\s+/g, '_')}_${records.year}_${records.month}.pdf`);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // --- Header ---
  doc.fontSize(18).text('MARITIME WATCHKEEPING AND REST HOURS RECORD', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(12).text('STCW Compliance Report', { align: 'center' });
  doc.moveDown(2);

  // --- User Meta Info ---
  doc.fontSize(11).text(`Seafarer Name: ${user.name}`, 50, doc.y, { continued: true })
     .text(`Rank: ${user.rank}`, { align: 'right' });
  
  doc.text(`Month/Year: ${records.month}/${records.year}`, 50, doc.y + 10, { continued: true })
     .text(`System ID: ${user.id}    Vessel: DEMO VESSEL`, { align: 'right' });

  doc.moveDown(2);

  // --- Table Header ---
  const tableTop = doc.y;
  const colDate = 50;
  const colWork = 150;
  const colRest = 250;
  const colStatus = 350;

  doc.font('Helvetica-Bold');
  doc.text('Date', colDate, tableTop);
  doc.text('Work Hours', colWork, tableTop);
  doc.text('Rest Hours', colRest, tableTop);
  doc.text('STCW Compliance', colStatus, tableTop);
  
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
  
  doc.font('Helvetica');
  let currentY = tableTop + 25;

  // --- Daily Grid ---
  records.days.forEach(day => {
    // Add new page if table goes off bottom margin
    if (currentY > 700) {
      doc.addPage();
      currentY = 50; // Reset Y

      // Redraw Header
      doc.font('Helvetica-Bold');
      doc.text('Date', colDate, currentY);
      doc.text('Work Hours', colWork, currentY);
      doc.text('Rest Hours', colRest, currentY);
      doc.text('STCW Compliance', colStatus, currentY);
      doc.moveTo(50, currentY + 15).lineTo(550, currentY + 15).stroke();
      doc.font('Helvetica');
      currentY += 25;
    }

    doc.text(day.date, colDate, currentY);
    doc.text(day.work.toFixed(1), colWork, currentY);
    doc.text(day.rest.toFixed(1), colRest, currentY);
    
    if (day.compliant) {
      doc.fillColor('green').text('COMPLIANT', colStatus, currentY).fillColor('black');
    } else {
      doc.fillColor('red').text('VIOLATION', colStatus, currentY).fillColor('black');
      
      // Optionally list violation reasons beneath
      if (day.violations.length > 0) {
        currentY += 15;
        doc.fontSize(8).fillColor('red');
        day.violations.forEach(v => {
          doc.text(`- ${v}`, colStatus, currentY);
          currentY += 10;
        });
        doc.fontSize(11).fillColor('black');
        currentY -= 10; // offset slightly for loop
      }
    }

    // Line separator
    currentY += 15;
    doc.moveTo(50, currentY).lineTo(550, currentY).lineWidth(0.5).strokeColor('#cccccc').stroke().lineWidth(1).strokeColor('black');
    currentY += 10;
  });

  doc.moveDown(3);

  // --- Signatures ---
  const sigY = doc.y + 20;
  doc.moveTo(50, sigY).lineTo(250, sigY).stroke();
  doc.text('Master Signature', 50, sigY + 10);

  doc.moveTo(350, sigY).lineTo(550, sigY).stroke();
  doc.text('Seafarer Signature', 350, sigY + 10);

  // Finalize PDF file
  doc.end();
};
