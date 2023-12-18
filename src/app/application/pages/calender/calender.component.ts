import { Component } from '@angular/core';
import { ExportService } from '../../../export.service';
@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss'],
})
export class CalenderComponent {
  constructor(private exportService: ExportService) {}

  showComparison = false;
  selectedDate: string = new Date().toISOString().slice(0, 7); // Initialize as YYYY-MM
  months: string[] = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  currentMonth = this.months[new Date(this.selectedDate).getMonth()];
  currentYear = new Date(this.selectedDate).getFullYear();
  get selectedDateObject(): Date {
    return new Date(this.selectedDate);
  }
  showComparisonFn() {
    this.showComparison = true;
  }
  hideComparisonFn() {
    this.showComparison = false;
  }
  prevMonth() {
    const currentMonthIndex = this.months.indexOf(this.currentMonth);
    const newMonthIndex = (currentMonthIndex - 1 + 12) % 12; // Ensure the result is a non-negative number

    const newYear = currentMonthIndex === 0 ? this.currentYear - 1 : this.currentYear;

    this.updateSelectedDate(newYear, newMonthIndex);
  }
  goToToday() {
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonthIndex = today.getMonth();

    this.updateSelectedDate(todayYear, todayMonthIndex);
  }
  nextMonth() {
    const currentMonthIndex = this.months.indexOf(this.currentMonth);

    const newMonthIndex = (currentMonthIndex + 1) % 12;

    const newYear = currentMonthIndex === 11 ? this.currentYear + 1 : this.currentYear;

    this.updateSelectedDate(newYear, newMonthIndex);
  }

  private updateSelectedDate(year: number, monthIndex: number) {
    this.currentMonth = this.months[monthIndex];
    this.currentYear = year;
    const month = (monthIndex + 1).toString().padStart(2, '0');
    this.selectedDate = new Date(`${year}-${month}`).toISOString().slice(0, 7);
  }
  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  generateCalendar(): Array<Array<number | null>> {
    const selectedMonth = this.selectedDateObject.getMonth();
    const selectedYear = this.selectedDateObject.getFullYear();

    const daysInMonth = this.getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = this.getFirstDayOfMonth(selectedMonth, selectedYear);

    let day = 1;
    const calendar: Array<Array<number | null>> = [];

    for (let week = 0; day <= daysInMonth; week++) {
      calendar[week] = [];
      for (let i = 0; i < 7; i++) {
        if (week === 0 && i < firstDay) {
          calendar[week][i] = null; // Empty slots before the first day
        } else if (day > daysInMonth) {
          calendar[week][i] = null; // Empty slots after the last day
        } else {
          calendar[week][i] = day;
          day++;
        }
      }
    }

    return calendar;
  }

  exportToPdf() {
    const element = document.getElementById('contentToExport');
    if (element) {
      this.exportService.exportToPdf(element, 'exportedFile');
    } else {
      console.error('Element with ID "contentToExport" not found.');
    }
  }

  exportToJpg() {
    const element = document.getElementById('contentToExport');
    if (element) {
      this.exportService.exportToJpg(element, 'exportedFile');
    } else {
      console.error('Element with ID "contentToExport" not found.');
    }
  }
}
