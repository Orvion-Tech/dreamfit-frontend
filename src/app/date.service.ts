// date.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  formatDate(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = this.padNumber(date.getMonth() + 1); // Months are zero-based
    const day = this.padNumber(date.getDate());

    // const hours = this.padNumber(date.getHours());
    // const minutes = this.padNumber(date.getMinutes());
    // const seconds = this.padNumber(date.getSeconds());

    const formattedDate = format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day);
    //   .replace('HH', hours)
    //   .replace('mm', minutes)
    //   .replace('ss', seconds);

    return formattedDate;
  }
  formatTime(date: Date): string {
    const hours = this.padNumber(date.getHours());
    const minutes = this.padNumber(date.getMinutes());
    // const seconds = this.padNumber(date.getSeconds());
    const currentTime = `${hours}:${minutes}`;
    return currentTime;
    // const timeZoneOffset = date.getTimezoneOffset() / 60;
    // console.log(timeZoneOffset);
    // return currentTime + ' (GMT' + (timeZoneOffset >= 0 ? '+' : '') + timeZoneOffset + ')';
  }
  formatDateTime(date: Date, format: string): string {
    const year = date.getFullYear();
    const month = this.padNumber(date.getMonth() + 1); // Months are zero-based
    const day = this.padNumber(date.getDate());

    const hours = this.padNumber(date.getHours());
    const minutes = this.padNumber(date.getMinutes());
    // const seconds = this.padNumber(date.getSeconds());

    const formattedDate = format
      .replace('yyyy', year.toString())
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes);
    // .replace('ss', seconds);

    return formattedDate;
  }
  private padNumber(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }
}
