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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  uploadedFiles: any;
  notToday = true;
  formattedDate!: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  homeData: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  personalData: any;
  personalDataUpdate = false;
  personalDataFilled = false;

  // personal detail
  weight = false;
  body_fat = false;
  body_mass = false;
  poopoo = false;
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
  }
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
  async onProfileSubmit() {
    let method = 'POST';
    if (this.personalDataUpdate) {
      method = 'PUT';
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
}
