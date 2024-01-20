/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { TokenService } from '../../../token.service';
import { DateService } from '../../../date.service';
import { AbortControllerService } from '../../../abort-controller.service';
import { ExportService } from '../../../export.service';
import moment from 'moment-timezone';

interface CalendarDataItem {
  body_fat: any;
  body_mass: any;
  created_at: any;
  daily_selfie_back: any;
  daily_selfie_front: any;
  daily_selfie_side: any;
  date_time: any;
  id: any;
  meanstation_cycle: any;
  poopoo_time: any;
  updated_at: any;
  user: any;
  weight: any;
}
@Component({
  selector: 'app-calender',
  templateUrl: './calender.component.html',
  styleUrls: ['./calender.component.scss'],
})
export class CalenderComponent implements OnInit {
  [x: string]: any;
  formattedDate!: string;
  calenderData: any;
  calendar: any;
  comparisonDate: any = [];
  newDate: string = '';
  compareData: any;
  constructor(
    private exportService: ExportService,
    private router: Router,
    private tokenService: TokenService,
    private dateService: DateService,
    private abortControllerService: AbortControllerService,
  ) {}
  ngOnInit(): void {
    const currentDate = new Date(); // You can pass any date you want to format
    this.formattedDate = this.dateService.formatMonth(currentDate, 'MM');
    if (this.tokenService.isTokenExpired()) {
      // Token has expired
      localStorage.removeItem('user_id');
      localStorage.removeItem('id_token');
      localStorage.removeItem('token_timestamp');
      this.router.navigate(['/login']);
    } else {
      this.getCalenderData(this.formattedDate);
    }
  }
  async getCalenderData(getDate: string) {
    const data = { month: getDate };
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    try {
      const response = await fetch('https://dssv33z9c6vvp.cloudfront.net/en/api/callender/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        signal: abortController.signal,
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.calenderData = await response.json();
        this.abortControllerService.resetAbortController();

        this.generateCalendar();
        // console.log(this.calenderData);
      } else {
        const data = await response.json();
        this.abortControllerService.resetAbortController();

        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  showComparison = false;
  comparisonType = 'front';
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
  selectComparision(val: string) {
    this.comparisonType = val;
  }
  async showComparisonFn() {
    if (this.comparisonDate.length > 0 && this.comparisonDate.length <= 3) {
      const data = { date: this.comparisonDate };
      this.abortControllerService.abortExistingRequest();
      const abortController = this.abortControllerService.createAbortController();
      try {
        const response = await fetch('https://dssv33z9c6vvp.cloudfront.net/en/api/comparison/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('id_token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          signal: abortController.signal,
        });

        if (response.ok) {
          this.compareData = await response.json();
          // this.generateCalendar();
          this.showComparison = true;
          this.abortControllerService.resetAbortController();

          console.log(this.compareData);
        } else {
          const data = await response.json();
          this.abortControllerService.resetAbortController();

          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    }
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
  onChange() {
    this.generateCalendar();
    this.updateSelectedDate(
      this.selectedDateObject.getFullYear(),
      this.selectedDateObject.getMonth(),
    );
  }
  private updateSelectedDate(year: number, monthIndex: number) {
    this.currentMonth = this.months[monthIndex];
    this.currentYear = year;
    const month = (monthIndex + 1).toString().padStart(2, '0');
    this.selectedDate = new Date(`${year}-${month}`).toISOString().slice(0, 7);
    this.generateCalendar();
  }
  getDaysInMonth(month: number, year: number): number {
    return new Date(year, month + 1, 0).getDate();
  }

  getFirstDayOfMonth(month: number, year: number): number {
    return new Date(year, month, 1).getDay();
  }

  // generateCalendar(): Array<Array<number | null>> {
  //   const selectedMonth = this.selectedDateObject.getMonth();
  //   const selectedYear = this.selectedDateObject.getFullYear();

  //   const daysInMonth = this.getDaysInMonth(selectedMonth, selectedYear);
  //   const firstDay = this.getFirstDayOfMonth(selectedMonth, selectedYear);

  //   let day = 1;
  //   const calendar: Array<Array<number | null>> = [];

  //   for (let week = 0; day <= daysInMonth; week++) {
  //     calendar[week] = [];
  //     for (let i = 0; i < 7; i++) {
  //       if (week === 0 && i < firstDay) {
  //         calendar[week][i] = null; // Empty slots before the first day
  //       } else if (day > daysInMonth) {
  //         calendar[week][i] = null; // Empty slots after the last day
  //       } else {
  //         calendar[week][i] = day;
  //         day++;
  //       }
  //     }
  //   }

  //   return calendar;
  // }
  generateCalendar() {
    const selectedMonth = this.selectedDateObject.getMonth();
    const selectedYear = this.selectedDateObject.getFullYear();
    const daysInMonth = this.getDaysInMonth(selectedMonth, selectedYear);
    const firstDay = this.getFirstDayOfMonth(selectedMonth, selectedYear);
    let day = 1;
    this.calendar = [];
    for (let week = 0; day <= daysInMonth; week++) {
      this.calendar[week] = [];
      for (let i = 0; i < 7; i++) {
        if (week === 0 && i < firstDay) {
          this.calendar[week][i] = { day: null, data: null }; // Empty slots before the first day
        } else if (day > daysInMonth) {
          this.calendar[week][i] = { day: null, data: null }; // Empty slots after the last day
        } else {
          // Check if there is data for the current day
          if (this.calenderData !== undefined && this.calenderData.callender_data !== undefined) {
            const dayData: CalendarDataItem | undefined = this.calenderData.callender_data.find(
              (data: CalendarDataItem) => {
                const dataDate = moment(data.date_time).tz('Asia/Hong_Kong');
                const dataYear = dataDate.year();
                const dataMonth = dataDate.month();
                const dataDay = dataDate.date();
                return dataYear === selectedYear && dataMonth === selectedMonth && dataDay === day;
              },
            );
            // console.log(dayData);
            this.calendar[week][i] = { day, data: dayData || null };
          } else {
            this.calendar[week][i] = { day, data: null };
          }
          // Assign both the day and the data to the calendar
          day++;
        }
      }
    }
    // return calendar;
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
  selectCompDate(date: any) {
    console.log(moment(date).tz('Asia/Hong_Kong').format('yyyy-MM-DD'), 'selected');
    // this.comparisonDate.push(compDate);
    // if (this.comparisonDate.length === 3) {
    //   console.log('done');
    // }
    // console.log(this.comparisonDate);
    if (this.comparisonDate.length > 3) {
      return;
    }
    const formattedDate = moment(date).tz('Asia/Hong_Kong').format('yyyy-MM-DD');
    this.newDate = formattedDate;
    if (this.comparisonDate.includes(this.newDate)) {
      this.comparisonDate = this.comparisonDate.filter((date: string) => date !== this.newDate);
    } else {
      this.comparisonDate.push(this.newDate);
    }
    this.newDate = '';
    console.log(this.comparisonDate);
  }
}
