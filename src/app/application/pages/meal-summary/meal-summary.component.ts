/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../token.service';
import { DateService } from '../../../date.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { AbortControllerService } from '../../../abort-controller.service';
@Component({
  selector: 'app-meal-summary',
  templateUrl: './meal-summary.component.html',
  styleUrls: ['./meal-summary.component.scss'],
})
export class MealSummaryComponent implements OnInit {
  showExportPopup = false;
  homeData: any;
  formattedDate!: string;
  formattedTime!: string;
  selectedDate: string = new Date().toISOString(); // Initialize as YYYY-MM

  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dateService: DateService,
    private abortControllerService: AbortControllerService,
  ) {}
  ngOnInit() {
    const currentDate = new Date(); // You can pass any date you want to format
    this.formattedDate = this.dateService.formatDate(currentDate, 'yyyy-MM-dd');
    this.formattedTime = this.dateService.formatTime(currentDate);
    if (this.tokenService.isTokenExpired()) {
      // Token has expired
      localStorage.removeItem('user_id');
      localStorage.removeItem('id_token');
      localStorage.removeItem('token_timestamp');
      this.router.navigate(['/login']);
    } else {
      this.homeDataApi(this.formattedDate);
    }
  }
  dateChange(event: any): void {
    // The event parameter contains information about the change
    const selectedDate: string = event.target.value;
    console.log(selectedDate);
    this.homeDataApi(selectedDate);
  }
  async homeDataApi(getDate: string) {
    const data = { date: getDate };
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    try {
      const response = await fetch('http://18.163.194.77/en/api/summary/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: abortController.signal,
      });

      if (response.ok) {
        this.homeData = await response.json();
        this.abortControllerService.resetAbortController();
        console.log(this.homeData);
      } else {
        const data = await response.json();
        this.abortControllerService.resetAbortController();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  showExport() {
    this.showExportPopup = true;
  }
  hideExport() {
    this.showExportPopup = false;
  }
  exportToPdf() {
    const element = document.getElementById('contentToExport');
    if (element) {
      html2canvas(element).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        // const imgWidth = 190; // A4 page width in mm
        // const imgHeight = (canvas.height * imgWidth) / canvas.width;
        // Calculate aspect ratio
        const aspectRatio = canvas.width / canvas.height;

        const maxWidth = pdf.internal.pageSize.getWidth() - 20;
        const maxHeight = pdf.internal.pageSize.getHeight() - 20;

        let imgWidth, imgHeight;
        if (aspectRatio > 1) {
          imgWidth = maxWidth;
          imgHeight = maxWidth / aspectRatio;
        } else {
          imgHeight = maxHeight;
          imgWidth = maxHeight * aspectRatio;
        }

        const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
        let y = (maxHeight - imgHeight) / 2;
        y = 10;
        pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
        pdf.setFontSize(32);
        pdf.setTextColor(200);
        // const dynamicInputs = document.getElementsByClassName('supplement__cont__box__input');

        // let yOffset = 20; // Adjust the starting Y position
        // let xOffset = 20; // Adjust the starting X position
        // const maxInputsPerRow = 5;

        // for (let i = 0; i < dynamicInputs.length; i++) {
        //   const inputElement = dynamicInputs[i] as HTMLInputElement;

        //   const inputValue = inputElement.value;
        //   pdf.setFontSize(12);
        //   // pdf.setTextColor(900);

        //   pdf.text(`${inputValue}`, xOffset, yOffset);

        //   // Move to the next row after reaching the maximum inputs per row
        //   if ((i + 1) % maxInputsPerRow === 0) {
        //     yOffset += 20; // Adjust the vertical spacing
        //     xOffset = 20; // Reset X position for the new row
        //   } else {
        //     xOffset += 60; // Adjust the horizontal spacing
        //   }
        // }

        // Calculate the number of rows based on the total number of inputs and the maximum inputs per row
        // const numRows = Math.ceil(dynamicInputs.length / maxInputsPerRow);

        // Calculate the total height required for all rows
        // const totalHeight = numRows * 20;

        // Adjust the PDF height if needed
        // pdf.internal.pageSize.height = totalHeight + 30;
        pdf.text('DreamFit', 40, 20);
        pdf.text('DreamFit', 120, 100);
        pdf.text('DreamFit', 40, 180);
        pdf.text('DreamFit', 120, 260);
        pdf.save(`meal-summary.pdf`);
      });
    } else {
      console.error('Element with ID "contentToExport" not found.');
    }
  }

  exportToJpg() {
    const element = document.getElementById('contentToExport');
    if (element) {
      // this.exportService.exportToJpg(element, 'exportedFile');
      html2canvas(element).then((canvas) => {
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
        marginContext.fillText('DreamFit', 40, 20);
        marginContext.fillText('DreamFit', 120, 100);
        marginContext.fillText('DreamFit', 40, 180);
        marginContext.fillText('DreamFit', 120, 260);

        // Set the href attribute to the data URL of the new canvas
        link.href = marginCanvas.toDataURL('image/jpeg');
        link.download = `meal-summary.jpg`;
        link.click();
      });
    } else {
      console.error('Element with ID "contentToExport" not found.');
    }
  }
}
