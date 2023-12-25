/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TokenService } from '../../../token.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateService } from '../../../date.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  personalProfileForm: FormGroup;
  showPersonal = false;
  showMeal = false;
  showMealForm = false;
  mealType = '';
  selectedFile: File | undefined;
  uploadedFiles: any;
  notToday = true;
  formattedDate!: string;
  formattedTime!: string;
  homeData: any;
  personalData: any;
  personalDataUpdate = false;
  personalDataFilled = false;
  weight = false;
  body_fat = false;
  body_mass = false;
  poopoo = false;

  /**
   *
   * Meal Form Start
   */
  mealForm: FormGroup;
  mealUploadedFiles: any;
  mealData: any;
  mealDataUpdate = false;
  /**
   *
   * Meal Form End
   */
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dateService: DateService,
    private fb: FormBuilder,
  ) {
    this.personalProfileForm = this.fb.group({
      weight: ['', Validators.required],
      poopoo: ['', Validators.required],
      body_fat: ['', Validators.required],
      body_mass: ['', Validators.required],
      meanstation_cycle: [false],
      daily_selfie_front: [''],
      daily_selfie_side: [''],
      daily_selfie_back: [''],
    });
    this.mealForm = this.fb.group({
      time: [''],
      rice: [''],
      meat: [''],
      veg: [''],
      fruit: [''],
      water: [''],
    });
  }
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
      this.personalDataApi(this.formattedDate, 'GET', null);
    }
  }
  prevDate() {
    this.notToday = false;
    // Parse the current formatted date into a Date object
    const currentDate = new Date(this.formattedDate);

    // Decrement the date by one day
    currentDate.setDate(currentDate.getDate() - 1);

    // Format the new date
    this.formattedDate = this.dateService.formatDate(currentDate, 'yyyy-MM-dd');

    // Call homeDataApi with the updated date
    this.homeDataApi(this.formattedDate);
    this.personalDataApi(this.formattedDate, 'GET', null);
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
  fileChangeEvent(event: { file: File; side: string }): void {
    const selectedFile = event.file;
    const side = event.side;
    if (!this.uploadedFiles) {
      this.uploadedFiles = [];
    }
    this.uploadedFiles.push({ selectedFile, side });
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
    this.mealDataApi(this.formattedDate, 'GET', null);
  }
  hideMeal() {
    this.showMealForm = false;
  }
  deleteLastFile(index: string) {
    // Implementation to delete the file at the specified index from the array
    // this.uploadedFiles.splice(index, 1);
    this.uploadedFiles = this.uploadedFiles.filter((item: { side: string }) => item.side !== index);
  }
  async personalDataApi(
    getDate: string | null = null,
    method: string,
    postData: BodyInit | null | undefined,
  ) {
    let url = `http://192.168.1.103/api/daily-profile/`;
    let data = postData;
    if (method === 'GET') {
      url = `http://192.168.1.103/api/daily-profile/?date=${getDate}`;
      data = null;
    }
    if (method === 'PATCH') {
      url = `http://192.168.1.103/api/daily-profile/${localStorage.getItem('dailyProfileId')}/`;
    }
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          // 'Content-Type': 'application/json',
        },
        body: data !== null ? data : undefined,
      });

      if (response.ok) {
        this.uploadedFiles = [];

        this.personalData = await response.json();
        let fillData;
        if (this.personalData.length > 0) {
          this.personalDataUpdate = true;
          fillData = this.personalData[0];
        } else {
          fillData = this.personalData;
        }
        console.log(fillData, 'api');
        if (Object.keys(fillData).length > 0) {
          localStorage.setItem('dailyProfileId', fillData.id);

          this.personalProfileForm!.get('meanstation_cycle')!.setValue(fillData.meanstation_cycle);
          this.personalProfileForm!.get('poopoo')!.setValue(fillData.poopoo_time);
          this.personalProfileForm!.get('weight')!.setValue(fillData.weight);
          this.personalProfileForm!.get('body_fat')!.setValue(fillData.body_fat);
          this.personalProfileForm!.get('body_mass')!.setValue(fillData.body_mass);
          if (fillData.daily_selfie_front !== null) {
            this.uploadedFiles.push({ selectedFile: fillData.daily_selfie_front, side: 'front' });
          }
          if (fillData.daily_selfie_back !== null) {
            this.uploadedFiles.push({ selectedFile: fillData.daily_selfie_back, side: 'back' });
          }
          if (fillData.daily_selfie_side !== null) {
            this.uploadedFiles.push({ selectedFile: fillData.daily_selfie_side, side: 'side' });
          }
        }
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  resetError() {
    this.weight = false;
    this.body_fat = false;
    this.body_mass = false;
    this.poopoo = false;
  }
  onProfileSubmit() {
    let method = 'POST';
    if (this.personalDataUpdate) {
      method = 'PATCH';
    }

    this.weight = true;
    this.body_fat = true;
    this.body_mass = true;
    this.poopoo = true;
    if (this.personalProfileForm.valid) {
      this.formattedDate = this.dateService.formatDate(new Date(), 'yyyy-MM-dd');

      const formData = new FormData();
      formData.append('weight', this.personalProfileForm.value.weight);
      formData.append('poopoo_time', this.personalProfileForm.value.poopoo);
      formData.append('body_fat', this.personalProfileForm.value.body_fat);
      formData.append('body_mass', this.personalProfileForm.value.body_mass);
      if (this.personalProfileForm.value.meanstation_cycle == true) {
        formData.append('meanstation_cycle', this.personalProfileForm.value.meanstation_cycle);
      }
      formData.append('user', localStorage.getItem('user_id') || '');
      formData.append('date_time', this.formattedDate);
      console.log(this.uploadedFiles);
      if (this.uploadedFiles !== undefined && this.uploadedFiles.length > 0) {
        const frontSide = this.uploadedFiles.find(
          (side: { side: string }) => side.side === 'front',
        );
        const sideSide = this.uploadedFiles.find((side: { side: string }) => side.side === 'side');
        const backSide = this.uploadedFiles.find((side: { side: string }) => side.side === 'back');
        console.log(frontSide, 'front');
        if (frontSide && typeof frontSide.selectedFile !== 'string') {
          formData.append('daily_selfie_front', frontSide.selectedFile);
        }
        if (sideSide && typeof sideSide.selectedFile !== 'string') {
          formData.append('daily_selfie_side', sideSide.selectedFile);
        }
        if (backSide && typeof backSide.selectedFile !== 'string') {
          formData.append('daily_selfie_back', backSide.selectedFile);
        }
      }

      this.personalDataApi(null, method, formData);
    }
  }
  deleteMealLastFile(index: string) {
    // Implementation to delete the file at the specified index from the array
    // this.uploadedFiles.splice(index, 1);
    this.mealUploadedFiles = this.mealUploadedFiles.filter(
      (item: { side: string }) => item.side !== index,
    );
  }
  mealFileChangeEvent(event: { file: File; side: string }): void {
    const selectedFile = event.file;
    const side = event.side;
    if (!this.mealUploadedFiles) {
      this.mealUploadedFiles = [];
    }
    this.mealUploadedFiles.push({ selectedFile, side });
    console.log(this.mealUploadedFiles);
  }
  onMealSubmit() {
    let method = 'POST';
    console.log(this.mealDataUpdate, 'request type');
    if (this.mealDataUpdate) {
      method = 'PATCH';
    }
    const mealTypeNo = this.getMealNumber();
    if (this.mealForm.valid) {
      // this.weight = true;
      // this.body_fat = true;
      // this.body_mass = true;
      // this.poopoo = true;
      this.formattedDate = this.dateService.formatDate(new Date(), 'yyyy-MM-dd');
      this.formattedTime = this.mealForm.value.time;
      const formData = new FormData();
      formData.append('meal_type', mealTypeNo);
      formData.append('user', localStorage.getItem('user_id') || '');
      formData.append('meal_time', `${this.formattedDate} ${this.formattedTime}`);
      if (this.mealForm.value.rice !== '') {
        formData.append('amount_of_rice_or_noodels', this.mealForm.value.rice);
      }
      if (this.mealForm.value.meat !== '') {
        formData.append('amount_of_meat', this.mealForm.value.meat);
      }
      if (this.mealForm.value.veg !== '') {
        formData.append('amount_of_vegitables', this.mealForm.value.veg);
      }
      if (this.mealForm.value.fruit !== '') {
        formData.append('amount_of_fruits', this.mealForm.value.fruit);
      }
      if (this.mealForm.value.water !== '') {
        formData.append('amount_of_water', this.mealForm.value.water);
      }
      console.log(this.mealUploadedFiles);
      if (this.mealUploadedFiles !== undefined && this.mealUploadedFiles.length > 0) {
        const frontSide = this.mealUploadedFiles.find(
          (side: { side: string }) => side.side === 'front',
        );
        const sideSide = this.mealUploadedFiles.find(
          (side: { side: string }) => side.side === 'side',
        );
        const backSide = this.mealUploadedFiles.find(
          (side: { side: string }) => side.side === 'back',
        );
        if (frontSide && typeof frontSide.selectedFile !== 'string') {
          formData.append('meal_photo_1', frontSide.selectedFile);
        }
        if (sideSide && typeof sideSide.selectedFile !== 'string') {
          formData.append('meal_photo_2', sideSide.selectedFile);
        }
        if (backSide && typeof backSide.selectedFile !== 'string') {
          formData.append('meal_photo_3', backSide.selectedFile);
        }
      }
      console.log(formData, 'meal info');
      this.mealDataApi(null, method, formData);
    }
  }
  async mealDataApi(
    getDate: string | null = null,
    method: string,
    postData: BodyInit | null | undefined,
  ) {
    let url = `http://192.168.1.103/api/meal-info/`;
    let data = postData;
    if (method === 'GET') {
      url = `http://192.168.1.103/api/meal-info/?date=${getDate}`;
      data = null;
    }
    if (method === 'PATCH') {
      url = `http://192.168.1.103/api/meal-info/${localStorage.getItem('dailyMealId')}/`;
    }
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          // 'Content-Type': 'application/json',
        },
        body: data !== null ? data : undefined,
      });

      if (response.ok) {
        this.mealUploadedFiles = [];

        this.mealData = await response.json();
        let fillData;
        if (this.mealData.length > 0) {
          this.mealDataUpdate = true;
          fillData = this.mealData[0];
        } else {
          fillData = this.mealData;
        }
        if (Object.keys(fillData).length > 0 && fillData.meal_type === this.getMealNumber()) {
          localStorage.setItem('dailyMealId', fillData.id);
          const date = new Date(fillData.meal_time).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
          console.log(date);
          this.mealForm!.get('time')!.setValue(date);
          this.mealForm!.get('rice')!.setValue(fillData.amount_of_rice_or_noodels);
          this.mealForm!.get('meat')!.setValue(fillData.amount_of_meat);
          this.mealForm!.get('veg')!.setValue(fillData.amount_of_vegitables);
          this.mealForm!.get('fruit')!.setValue(fillData.amount_of_fruits);
          this.mealForm!.get('water')!.setValue(fillData.amount_of_water);
          if (fillData.meal_photo_1 !== null) {
            this.mealUploadedFiles.push({
              selectedFile: fillData.meal_photo_1,
              side: 'front',
            });
          }
          if (fillData.meal_photo_2 !== null) {
            this.mealUploadedFiles.push({ selectedFile: fillData.meal_photo_2, side: 'back' });
          }
          if (fillData.meal_photo_3 !== null) {
            this.mealUploadedFiles.push({ selectedFile: fillData.meal_photo_3, side: 'side' });
          }
        } else {
          this.mealForm!.get('time')!.setValue(this.dateService.formatTime(new Date()));
          this.mealForm!.get('rice')!.setValue('');
          this.mealForm!.get('meat')!.setValue('');
          this.mealForm!.get('veg')!.setValue('');
          this.mealForm!.get('fruit')!.setValue('');
          this.mealForm!.get('water')!.setValue('');
          this.mealUploadedFiles = [];
        }
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }
  getMealNumber() {
    let mealTypeNo = '';
    if (this.mealType === 'Breakfast') {
      mealTypeNo = '1';
    }
    if (this.mealType === 'Lunch') {
      mealTypeNo = '2';
    }
    if (this.mealType === 'Dinner') {
      mealTypeNo = '3';
    }
    if (this.mealType === 'Snacks') {
      mealTypeNo = '4';
    }
    return mealTypeNo;
  }
}
