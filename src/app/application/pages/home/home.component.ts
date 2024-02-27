/* eslint-disable @typescript-eslint/no-explicit-any */
import { Router } from '@angular/router';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { TokenService } from '../../../token.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateService } from '../../../date.service';
import { AbortControllerService } from '../../../abort-controller.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  rice: any = 0;
  sanitizedMessage: SafeHtml = '';
  meat: any = 0;
  veg: any = 0;
  fruit: any = 0;
  water: any = 0;
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
  apiDate = new Date();
  personalDataUpdate = false;
  personalDataFilled = false;
  weight = false;
  body_fat = false;
  body_mass = false;
  poopoo = false;
  showFullMsg = false;
  calculatedBodyMass!: number;
  loading = false;
  showProfileAlert = false;
  noSecretMsg = false;
  /**
   *
   * Meal Form Start
   */
  mealForm: FormGroup;
  mealUploadedFiles: any;
  mealData: any;
  mealDataUpdate = false;
  consumed_suppliment: any;
  mealSuppData: any;
  /**
   *
   * Meal Form End
   */
  constructor(
    private router: Router,
    private tokenService: TokenService,
    private dateService: DateService,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private abortControllerService: AbortControllerService,
  ) {
    this.personalProfileForm = this.fb.group({
      weight: ['', Validators.required],
      poopoo: ['', Validators.required],
      body_fat: ['', Validators.required],
      body_mass: [''],
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
  formatMessage(text: string): string {
    // Replace escaped characters with line breaks
    return text.replace(/\\r\\n/g, '<br>');
  }
  calculateBodyMass() {
    const weight = this.personalProfileForm.get('weight')!.value;
    const bodyFat = this.personalProfileForm.get('body_fat')!.value;

    // Calculate body mass using the formula: body mass = weight * body fat
    const mass = (weight * bodyFat) / 100;
    this.calculatedBodyMass = parseFloat(mass.toFixed(1));
  }
  // getConsumedQuantity(supplement: any): number {
  //   const consumedItem = this.consumed_suppliment.find(
  //     (item: any) => item.suppliment.id === supplement.id,
  //   );
  //   return consumedItem ? consumedItem.quantity : 0;
  // }
  getConsumedQuantity(supplement: any): number {
    const consumedItem = this.consumed_suppliment
      .filter((item: any) => item.suppliment.id === supplement.id)
      .reduce((acc: any, item: { quantity: any }) => acc + item.quantity, 0);

    return consumedItem ? consumedItem : 0;
  }
  getConsumedMealQuantity(supplement: any): number {
    const consumedItem = this.mealSuppData.suppliment
      .filter((item: any) => item.suppliment.id === supplement.id)
      .reduce((acc: any, item: { quantity: any }) => acc + item.quantity, 0);
    return consumedItem ? consumedItem : 0;
  }
  showMsg() {
    this.showFullMsg = !this.showFullMsg;
  }
  prevDate() {
    this.notToday = false;
    // Parse the current formatted date into a Date object
    const currentDate = new Date(this.formattedDate);

    // Decrement the date by one day
    currentDate.setDate(currentDate.getDate() - 1);
    // Format the new date
    this.formattedDate = this.dateService.formatDate(currentDate, 'yyyy-MM-dd');
    this.apiDate = currentDate;

    // Call homeDataApi with the updated date
    this.homeDataApi(this.formattedDate);
    this.personalDataApi(this.formattedDate, 'GET', null);
  }
  async homeDataApi(getDate: string) {
    const data = { date: getDate };
    // this.abortControllerService.abortExistingRequest();
    // const abortController = this.abortControllerService.createAbortController();
    try {
      const response = await fetch('https://admin.dreamfithk.com/en/api/home-summary/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        // signal: abortController.signal,
      });

      if (response.ok) {
        this.homeData = await response.json();
        // this.abortControllerService.resetAbortController();
        this.consumed_suppliment = this.homeData.consumed_suppliment;
        if (this.homeData.message_from_tutor !== null) {
          this.sanitizedMessage = this.sanitizer.bypassSecurityTrustHtml(
            this.homeData.message_from_tutor.message,
          );
        }
      } else {
        const data = await response.json();
        // this.abortControllerService.resetAbortController();
        if (data.message[0] === 'No secret code found for this date') {
          this.noSecretMsg = true;
        } else {
          this.noSecretMsg = false;
        }
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
  }
  personalClick() {
    this.showPersonal = !this.showPersonal;
  }
  mealClick() {
    this.showMeal = !this.showMeal;
  }
  showMealFormClick(data: string) {
    this.mealType = data;
    const date = this.dateService.formatDate(this.apiDate, 'yyyy-MM-dd');
    this.mealDataApi(date, 'GET', null);
    this.showMealForm = true;
  }
  hideMeal() {
    this.mealForm!.get('time')!.setValue(this.dateService.formatTime(new Date()));
    this.mealForm!.get('rice')!.setValue('0');
    this.mealForm!.get('meat')!.setValue('0');
    this.mealForm!.get('veg')!.setValue('0');
    this.mealForm!.get('fruit')!.setValue('0');
    this.mealForm!.get('water')!.setValue('0');
    this.mealUploadedFiles = [];
    this.showMealForm = false;
    window.location.reload();
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
    let url = `https://admin.dreamfithk.com/en/api/daily-profile/`;
    let data = postData;
    if (method === 'GET') {
      url = `https://admin.dreamfithk.com/en/api/daily-profile/?date=${getDate}`;
      data = null;
    }
    if (method === 'PATCH') {
      url = `https://admin.dreamfithk.com/en/api/daily-profile/${localStorage.getItem(
        'dailyProfileId',
      )}/`;
    }
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          // 'Content-Type': 'application/json',
        },
        body: data !== null ? data : undefined,
        signal: abortController.signal,
      });

      if (response.ok) {
        this.uploadedFiles = [];

        this.personalData = await response.json();
        if (this.personalData.length === 0) {
          this.showProfileAlert = true;
        } else {
          this.showProfileAlert = false;
        }
        let fillData;
        if (this.personalData.length > 0) {
          this.personalDataUpdate = true;
          fillData = this.personalData[0];
        } else {
          fillData = this.personalData;
        }
        if (Object.keys(fillData).length > 0) {
          localStorage.setItem('dailyProfileId', fillData.id);

          this.personalProfileForm!.get('meanstation_cycle')!.setValue(fillData.meanstation_cycle);
          this.personalProfileForm!.get('poopoo')!.setValue(fillData.poopoo_time);
          this.personalProfileForm!.get('weight')!.setValue(fillData.weight);
          this.personalProfileForm!.get('body_fat')!.setValue(fillData.body_fat);
          this.calculatedBodyMass = fillData.body_mass;
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
        if (method !== 'GET') {
          alert('Your information has been submitted successfully.');
        }
        this.abortControllerService.resetAbortController();
      } else {
        const data = await response.json();
        this.abortControllerService.resetAbortController();
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
      this.formattedTime = this.dateService.formatTime(new Date());
      const formData = new FormData();
      formData.append('weight', this.personalProfileForm.value.weight);
      formData.append('poopoo_time', this.personalProfileForm.value.poopoo);
      formData.append('body_fat', this.personalProfileForm.value.body_fat);
      formData.append('body_mass', this.calculatedBodyMass.toString());
      if (this.personalProfileForm.value.meanstation_cycle == true) {
        formData.append('meanstation_cycle', this.personalProfileForm.value.meanstation_cycle);
      }
      formData.append('user', localStorage.getItem('user_id') || '');
      formData.append('date_time', `${this.formattedDate} ${this.formattedTime}`);
      if (this.uploadedFiles !== undefined && this.uploadedFiles.length > 0) {
        const frontSide = this.uploadedFiles.find(
          (side: { side: string }) => side.side === 'front',
        );
        const sideSide = this.uploadedFiles.find((side: { side: string }) => side.side === 'side');
        const backSide = this.uploadedFiles.find((side: { side: string }) => side.side === 'back');
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
  }
  onMealSubmit() {
    this.loading = true;
    let method = 'POST';
    if (this.mealDataUpdate) {
      method = 'PATCH';
    }
    const mealTypeNo = this.getMealNumber();
    if (this.mealForm.valid) {
      this.formattedDate = this.dateService.formatDate(this.apiDate, 'yyyy-MM-dd');

      this.formattedTime = this.mealForm.value.time;
      const supplementArray: {
        quantity: number;
        suppliment: { id: number };
        date: string;
      }[] = [];
      const inputElements = document.querySelectorAll(
        '.supplement__cont__box__input',
      ) as NodeListOf<HTMLInputElement>;

      inputElements.forEach((inputElement) => {
        if (inputElement.value > '0') {
          const data = {
            quantity: parseInt(inputElement.value),
            suppliment: { id: parseInt(inputElement.id) },
            date: `${this.formattedDate} ${this.formattedTime}`,
          };
          supplementArray.push(data);
        }
      });
      const data = {
        meal_type: mealTypeNo,
        user: localStorage.getItem('user_id') || '',
        meal_time: `${this.formattedDate} ${this.formattedTime}`,
        amount_of_rice_or_noodels: this.mealForm.value.rice,
        amount_of_meat: this.mealForm.value.meat,
        amount_of_vegitables: this.mealForm.value.veg,
        amount_of_water: this.mealForm.value.water,
        amount_of_fruits: this.mealForm.value.fruit,
        suppliment: supplementArray,
      };

      this.mealDataApi(null, method, data);
    }
  }
  async mealPhotoApi(getDate: string | null = null, method: string) {
    const mealTypeNo = this.getMealNumber();

    const formData = new FormData();
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
        formData.append('meal_photo_3', sideSide.selectedFile);
      }
      if (backSide && typeof backSide.selectedFile !== 'string') {
        formData.append('meal_photo_2', backSide.selectedFile);
      }
    }
    formData.append('meal_type', mealTypeNo);
    formData.append('meal_time', `${this.formattedDate} ${this.formattedTime}`);
    formData.append('user', localStorage.getItem('user_id') || '');
    let url = `https://admin.dreamfithk.com/en/api/meal-info/`;
    let data: FormData | null = formData;
    if (method === 'GET') {
      url = `https://admin.dreamfithk.com/en/api/meal-info/?date=${getDate}`;
      data = null;
    }
    if (method === 'PATCH') {
      url = `https://admin.dreamfithk.com/en/api/meal-info/${localStorage.getItem('dailyMealId')}/`;
    }
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
        body: data !== null ? data : undefined,
      });

      if (response.ok) {
        if (method !== 'GET') {
          alert('Your information has been submitted successfully.');
          window.location.reload();
          this.showMealForm = false;
          this.loading = false;
        } else {
          this.mealUploadedFiles = [];
          this.mealData = await response.json();
          let fillData;
          if (this.mealData.length > 0) {
            fillData = this.mealData.filter(
              (mealType: { meal_type: string }) => mealType.meal_type === this.getMealNumber(),
            )[0];
          } else {
            fillData = this.mealData;
          }
          if (fillData !== undefined && fillData.meal_type === this.getMealNumber()) {
            this.mealDataUpdate = true;
          }
          if (
            fillData !== undefined &&
            Object.keys(fillData).length > 0 &&
            fillData.meal_type === this.getMealNumber()
          ) {
            localStorage.setItem('dailyMealId', fillData.id);
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
            this.mealUploadedFiles = [];
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
  async mealDataApi(getDate: string | null = null, method: string, postData: any) {
    let url = `https://admin.dreamfithk.com/en/api/meal-info/`;
    let data = postData;
    if (method === 'GET') {
      url = `https://admin.dreamfithk.com/en/api/meal-info/?date=${getDate}`;
      data = null;
    }
    if (method === 'PATCH') {
      url = `https://admin.dreamfithk.com/en/api/meal-info/${localStorage.getItem('dailyMealId')}/`;
    }
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: data !== null ? JSON.stringify(data) : undefined,
      });

      if (response.ok) {
        this.mealData = await response.json();
        let fillData;
        if (this.mealData.length > 0) {
          fillData = this.mealData.filter(
            (mealType: { meal_type: string }) => mealType.meal_type === this.getMealNumber(),
          )[0];
        } else {
          fillData = this.mealData;
        }
        this.mealSuppData = fillData;

        if (fillData !== undefined && fillData.meal_type === this.getMealNumber()) {
          this.mealDataUpdate = true;
        } else {
          this.mealDataUpdate = false;
        }
        if (
          fillData !== undefined &&
          Object.keys(fillData).length > 0 &&
          fillData.meal_type === this.getMealNumber()
        ) {
          localStorage.setItem('dailyMealId', fillData.id);

          if (this.mealUploadedFiles !== undefined && this.mealUploadedFiles.length > 0) {
            this.mealPhotoApi(null, 'PATCH');
          } else {
            if (method !== 'GET') {
              alert('Your information has been submitted successfully.');
              this.loading = false;
              this.showMealForm = false;
              window.location.reload();
            }
          }

          // const date = new Date(fillData.meal_time).toLocaleTimeString([], {
          //   hour: '2-digit',
          //   minute: '2-digit',
          //   hour12: false,
          // });
          const date = new Date(fillData.meal_time);
          let hours = date.getHours();
          const minutes = date.getMinutes();

          // Adjust hours if they exceed 24
          hours = hours >= 24 ? hours % 24 : hours;

          // Convert hours and minutes to string and pad with leading zeros if necessary
          const formattedHours = hours < 10 ? '0' + hours : hours;
          const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

          // Construct the formatted time string
          const formattedTime = `${formattedHours}:${formattedMinutes}`;

          this.mealForm!.get('time')!.setValue(formattedTime);
          this.mealForm!.get('rice')!.setValue(fillData.amount_of_rice_or_noodels);
          this.mealForm!.get('meat')!.setValue(fillData.amount_of_meat);
          this.mealForm!.get('veg')!.setValue(fillData.amount_of_vegitables);
          this.mealForm!.get('fruit')!.setValue(fillData.amount_of_fruits);
          this.mealForm!.get('water')!.setValue(fillData.amount_of_water);
          this.mealUploadedFiles = [];

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
          this.mealForm!.get('rice')!.setValue('0');
          this.mealForm!.get('meat')!.setValue('0');
          this.mealForm!.get('veg')!.setValue('0');
          this.mealForm!.get('fruit')!.setValue('0');
          this.mealForm!.get('water')!.setValue('0');
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
