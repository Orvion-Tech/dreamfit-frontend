import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  corsProxyUrl = 'https://dc98nj6to71ef.cloudfront.net';

  exportToPdf(element: HTMLElement, fileName: string) {
    html2canvas(element, {
      scale: 1,
      logging: true,
      useCORS: true,
      proxy: this.corsProxyUrl,
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      const imgWidth = 190; // A4 page width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight);
      pdf.setFontSize(32);
      pdf.setTextColor(200);
      // pdf.text('DreamFit', 40, 20);
      // pdf.text('DreamFit', 120, 100);
      // pdf.text('DreamFit', 40, 180);
      // pdf.text('DreamFit', 120, 260);
      pdf.save(`${fileName}.pdf`);
    });
  }

  exportToJpg(element: HTMLElement, fileName: string) {
    html2canvas(element, {
      scale: 3, // Adjust the scale as needed
      useCORS: true, // Corrected from userCORS to useCORS
      proxy: this.corsProxyUrl,
    }).then((canvas) => {
      //   const imgData = canvas.toDataURL('image/jpeg');
      const link = document.createElement('a');
      const margin = 10;
      // Create a new canvas element with additional space for the margin
      const marginCanvas = document.createElement('canvas');
      const marginContext = marginCanvas.getContext('2d')!;
      marginCanvas.width = canvas.width + 2 * margin;
      marginCanvas.height = canvas.height + 2 * margin;
      marginContext.fillStyle = 'white'; // Set the background color, change as needed
      marginContext.fillRect(0, 0, marginCanvas.width, marginCanvas.height);

      // Draw the original canvas onto the new canvas with the specified margin
      marginContext.drawImage(canvas, margin, margin);
      marginContext.font = '32px Arial';
      marginContext.fillStyle = 'black'; // Set the text color, change as needed
      // marginContext.fillText('DreamFit', 40, 20);
      // marginContext.fillText('DreamFit', 120, 100);
      // marginContext.fillText('DreamFit', 40, 180);
      // marginContext.fillText('DreamFit', 120, 260);

      // Set the href attribute to the data URL of the new canvas
      link.href = marginCanvas.toDataURL('image/jpeg');
      link.download = `${fileName}.jpg`;
      link.click();
    });
  }
}
