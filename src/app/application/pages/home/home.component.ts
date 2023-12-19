import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TokenService } from '../../../token.service';
import { DateService } from '../../../date.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  showPersonal = false;
  showMeal = false;
  showMealForm = false;
  mealType = '';
  selectedFile: File | undefined;
  uploadedFiles: File[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homeData: any;
  formattedDate!: string;
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dateService: DateService,
  ) {}
  ngOnInit() {
    const currentDate = new Date(); // You can pass any date you want to format
    this.formattedDate = this.dateService.formatDate(currentDate, 'yyyy-MM-dd');
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
  prevDate() {
    // Parse the current formatted date into a Date object
    const currentDate = new Date(this.formattedDate);

    // Decrement the date by one day
    currentDate.setDate(currentDate.getDate() - 1);

    // Format the new date
    this.formattedDate = this.dateService.formatDate(currentDate, 'yyyy-MM-dd');

    // Call homeDataApi with the updated date
    this.homeDataApi(this.formattedDate);
  }
  async homeDataApi(getDate: string) {
    const data = { date: getDate };
    try {
      const response = await fetch('http://192.168.1.103/api/home-summary/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.homeData = await response.json();
        console.log(this.homeData);
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  fileChangeEvent(uploadedFile: File) {
    this.uploadedFiles.push(uploadedFile);
    console.log(this.uploadedFiles);
  }
  personalClick() {
    this.showPersonal = !this.showPersonal;
  }
  mealClick() {
    this.showMeal = !this.showMeal;
  }
  showMealFormClick(data: string) {
    this.mealType = data;
    this.showMealForm = true;
  }
  hideMeal() {
    this.showMealForm = false;
  }
  deleteLastFile(index: number) {
    // Implementation to delete the file at the specified index from the array
    this.uploadedFiles.splice(index, 1);
  }
}
