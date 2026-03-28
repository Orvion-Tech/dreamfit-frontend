/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbortControllerService } from '../../../abort-controller.service';
import { Router } from '@angular/router';
import { MatDatepicker } from '@angular/material/datepicker';
import { TokenService } from '../../../token.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  @ViewChild('dobPicker') dobPicker!: MatDatepicker<Date>;
  options = [
    { value: 1, label: 'NA', selected: false },
    { value: 2, label: 'Sweets', selected: false },
    { value: 3, label: 'Spicy Food', selected: false },
    { value: 4, label: 'Strong Food', selected: false },
    { value: 5, label: 'Dairy Products', selected: false },
    { value: 6, label: 'Snacks', selected: false },
  ];
  selectedOptions: number[] = [];

  profileData: any;
  ProfileForm: FormGroup;
  profilePatch = false;
  profileId = '';
  profileImage = '';
  BMI = 0;
  bseCalorie = 0;
  dailyCalorie = 0;
  calculatedBodyMass!: number;
  loading = false;

  ngOnInit(): void {
    if (this.tokenService.isTokenExpired()) {
      // Token has expired
      localStorage.removeItem('user_id');
      localStorage.removeItem('id_token');
      localStorage.removeItem('token_timestamp');
      this.router.navigate(['/login']);
    } else {
      this.getProfileData('GET', null);
    }
  }
  openDatePicker(datepicker: MatDatepicker<Date>) {
    datepicker.open();
  }
  calculateBodyMass() {
    const weight = this.ProfileForm.get('weight')!.value;
    const bodyFat = this.ProfileForm.get('body_fat')!.value;

    // Calculate body mass using the formula: body mass = weight * body fat
    const mass = (weight * bodyFat) / 100;
    this.calculatedBodyMass = parseFloat(mass.toFixed(1));
  }
  constructor(
    private fb: FormBuilder,
    private abortControllerService: AbortControllerService,
    private router: Router,
    private tokenService: TokenService,
  ) {
    this.ProfileForm = this.fb.group({
      user_image: [null],
      first_name: [''],
      last_name: [''],
      birth_date: [null],
      gender: [''],
      height: [null],
      weight: [null],
      body_fat: [null],
      body_mass: [null],
      waist: [null],
      hips: [null],
      activity_level: [''],
      sleep_time: [null],
      wakeup_time: [null],
      sleep_quality: [''],
      meanstation_cycle: [false],
      family_history: [''],
      regular_medicine: [''],
      cronical_information: [''],
      food_allergy: [''],
      food_test_preference: [''],
      bowl_movememnt_trend: [''],
      normal_stool_form: [''],
      work_stress_index: [''],
    });
  }
  toggleOption(option: any) {
    const index = this.selectedOptions.indexOf(option);
    if (index !== -1) {
      this.selectedOptions.splice(index, 1);
    } else {
      this.selectedOptions.push(parseInt(option));
    }
    console.log(this.selectedOptions);
  }

  isSelected(option: any): boolean {
    return option.selected;
  }
  handleFileInput(controlName: string, event: Event) {
    let method = 'POST';
    if (this.profilePatch) {
      method = 'PATCH';
    }
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files) {
      const file = inputElement.files[0];
      const maxFileSizeInBytes = 8 * 1024 * 1024;
      if (file && file.size > maxFileSizeInBytes) {
        this.ProfileForm.get(controlName)?.setErrors({ fileSizeExceeded: true });

        // alert('File size exceeds the limit (8MB). Please select a smaller file.');
        // You can reset the input if needed
        inputElement.value = '';
      } else {
        this.ProfileForm.get(controlName)?.setErrors(null);

        this.ProfileForm.get(controlName)!.setValue(file);
        const formData = new FormData();
        formData.append('user_image', this.ProfileForm.value.user_image);
        this.uploadFile(method, formData);

        // File size is within the limit - proceed with handling the file
        // Your file handling logic here
      }
    }
  }
  async uploadFile(method: string, postData: any | null | undefined) {
    console.log(method, postData);
    this.loading = true;
    let url = `https://admin.dreamfithk.com/en/api/profile/`;
    const data = postData;
    if (method === 'PATCH') {
      url = `https://admin.dreamfithk.com/en/api/profile/${this.profileId}/`;
    }
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
        },
        signal: abortController.signal,
        body: data !== null ? data : undefined,
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log(profileData);
        let data: any;
        if (profileData.length > 0) {
          data = profileData[0];
        } else {
          data = profileData;
        }
        if (data.id !== undefined && data.id !== null) {
          if (data.user.user_image) {
            this.profileImage = data.user.user_image;
          }
          const birthdate: Date = new Date(data.user.birth_date);
          const bdate_time = birthdate.getTime();
          const current_time = Date.now();
          const diff = current_time - bdate_time;
          const age_dt = new Date(diff);
          const year = age_dt.getUTCFullYear();
          const age = Math.abs(year - 1970);
          let bmr = 0;
          let amr = 0;
          if (data.height > 0 && data.weight > 0) {
            const height_in_m = data.height / 100;
            const tmpBmi = data.weight / (height_in_m * height_in_m);
            this.BMI = parseFloat(tmpBmi.toFixed(1));
          }
          if (data.user.gender === '1') {
            bmr = 66.47 + 13.75 * data.weight + 5.003 * data.height - 6.755 * age;
          } else {
            bmr = 655.1 + 9.563 * data.weight + 1.85 * data.height - 4.676 * age;
          }
          this.bseCalorie = Math.round(bmr);
          if (data.activity_level == '1') {
            amr = 1.2 * bmr;
          } else if (data.activity_level == '2') {
            amr = 1.375 * bmr;
          } else if (data.activity_level == '3') {
            amr = 1.55 * bmr;
          } else if (data.activity_level == '4') {
            amr = 1.725 * bmr;
          } else if (data.activity_level == '5') {
            amr = 1.9 * bmr;
          }
          this.dailyCalorie = Math.round(amr);
          this.profilePatch = true;
          this.profileId = data.id;
          this.ProfileForm!.get('first_name')!.setValue(data.user.first_name);
          this.ProfileForm!.get('last_name')!.setValue(data.user.last_name);
          this.ProfileForm!.get('birth_date')!.setValue(data.user.birth_date);
          this.ProfileForm!.get('gender')!.setValue(data.user.gender);
          this.ProfileForm!.get('user_image')!.setValue(data.user.user_image);
          this.ProfileForm!.get('weight')!.setValue(data.weight);
          this.ProfileForm!.get('height')!.setValue(data.height);
          this.calculatedBodyMass = data.body_mass;
          this.ProfileForm!.get('body_fat')!.setValue(data.body_fat);
          // this.ProfileForm!.get('body_mass')!.setValue(data.body_mass);
          this.ProfileForm!.get('waist')!.setValue(data.waist);
          this.ProfileForm!.get('hips')!.setValue(data.hips);
          this.ProfileForm!.get('activity_level')!.setValue(data.activity_level);
          this.ProfileForm!.get('sleep_time')!.setValue(data.sleep_time);
          this.ProfileForm!.get('wakeup_time')!.setValue(data.wakeup_time);
          this.ProfileForm!.get('sleep_quality')!.setValue(data.sleep_quality);
          this.ProfileForm!.get('family_history')!.setValue(data.family_history);
          this.ProfileForm!.get('regular_medicine')!.setValue(data.regular_medicine);
          this.ProfileForm!.get('cronical_information')!.setValue(data.cronical_information);
          this.ProfileForm!.get('food_allergy')!.setValue(data.food_allergy);
          this.ProfileForm!.get('bowl_movememnt_trend')!.setValue(data.bowl_movememnt_trend);
          this.ProfileForm!.get('normal_stool_form')!.setValue(data.normal_stool_form);
          this.ProfileForm!.get('work_stress_index')!.setValue(data.work_stress_index);
          this.ProfileForm!.get('meanstation_cycle')!.setValue(data.meanstation_cycle);
          if (data.food_test_preference.length > 0) {
            this.selectedOptions = data.food_test_preference;
            this.options.forEach((option) => {
              option.selected = data.food_test_preference.includes(option.value);
              const checkbox = document.querySelector(
                `input[value="${option.value}"]`,
              ) as HTMLInputElement;
              if (checkbox) {
                checkbox.checked = option.selected;
              }
            });
          }
        }
        if (method !== 'GET') {
          this.loading = false;
          alert('Your Profile Picture has been updated successfully.');
        }
        window.location.reload();
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
  async getProfileData(method: string, postData: any | null | undefined) {
    if (method !== 'GET') {
      this.loading = true;
    }
    let url = `https://admin.dreamfithk.com/en/api/profile/`;
    let data = postData;
    if (method === 'GET') {
      data = null;
    }
    if (method === 'PATCH') {
      url = `https://admin.dreamfithk.com/en/api/profile/${this.profileId}/`;
    }
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem('id_token')}`,
          'Content-Type': 'application/json',
        },
        body: data !== null ? JSON.stringify(data) : undefined,
        signal: abortController.signal,
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log(profileData);
        let data: any;
        if (profileData.length > 0) {
          data = profileData[0];
        } else {
          data = profileData;
        }
        if (data.id !== undefined && data.id !== null) {
          if (data.user.user_image) {
            this.profileImage = data.user.user_image;
          }
          const birthdate: Date = new Date(data.user.birth_date);
          const bdate_time = birthdate.getTime();
          const current_time = Date.now();
          const diff = current_time - bdate_time;
          const age_dt = new Date(diff);
          const year = age_dt.getUTCFullYear();
          const age = Math.abs(year - 1970);
          let bmr = 0;
          let amr = 0;
          if (data.height > 0 && data.weight > 0) {
            const height_in_m = data.height / 100;
            const tmpBmi = data.weight / (height_in_m * height_in_m);
            this.BMI = parseFloat(tmpBmi.toFixed(1));
          }
          if (data.user.gender === '1') {
            bmr = 10 * data.weight + 6.25 * data.height - 5 * age + 5;
            // bmr = 66.47 + 13.75 * data.weight + 5.003 * data.height - 6.755 * age;
          } else {
            bmr = 10 * data.weight + 6.25 * data.height - 5 * age - 161;
            // bmr = 655.1 + 9.563 * data.weight + 1.85 * data.height - 4.676 * age;
          }
          this.bseCalorie = Math.round(bmr);
          if (data.activity_level == '1') {
            amr = 1.2 * bmr;
          } else if (data.activity_level == '2') {
            amr = 1.375 * bmr;
          } else if (data.activity_level == '3') {
            amr = 1.55 * bmr;
          } else if (data.activity_level == '4') {
            amr = 1.725 * bmr;
          } else if (data.activity_level == '5') {
            amr = 1.9 * bmr;
          }
          this.dailyCalorie = Math.round(amr);

          // this.BMI = data.bmi;
          // if (data.bmi !== null) {
          // }
          // if (data.bcr !== null) {
          //   this.bseCalorie = data.bcr;
          // }
          if (data.acr !== null) {
            this.dailyCalorie = data.acr;
          }
          this.profilePatch = true;
          this.profileId = data.id;
          this.ProfileForm!.get('first_name')!.setValue(data.user.first_name);
          this.ProfileForm!.get('last_name')!.setValue(data.user.last_name);
          this.ProfileForm!.get('birth_date')!.setValue(data.user.birth_date);
          this.ProfileForm!.get('gender')!.setValue(data.user.gender);
          this.ProfileForm!.get('user_image')!.setValue(data.user.user_image);
          this.ProfileForm!.get('height')!.setValue(data.height);
          this.ProfileForm!.get('weight')!.setValue(data.weight);
          this.calculatedBodyMass = data.body_mass;
          this.ProfileForm!.get('body_fat')!.setValue(data.body_fat);
          // this.ProfileForm!.get('body_mass')!.setValue(data.body_mass);
          this.ProfileForm!.get('waist')!.setValue(data.waist);
          this.ProfileForm!.get('hips')!.setValue(data.hips);
          this.ProfileForm!.get('activity_level')!.setValue(data.activity_level);
          this.ProfileForm!.get('sleep_time')!.setValue(data.sleep_time);
          this.ProfileForm!.get('wakeup_time')!.setValue(data.wakeup_time);
          this.ProfileForm!.get('sleep_quality')!.setValue(data.sleep_quality);
          this.ProfileForm!.get('family_history')!.setValue(data.family_history);
          this.ProfileForm!.get('regular_medicine')!.setValue(data.regular_medicine);
          this.ProfileForm!.get('cronical_information')!.setValue(data.cronical_information);
          this.ProfileForm!.get('food_allergy')!.setValue(data.food_allergy);
          this.ProfileForm!.get('bowl_movememnt_trend')!.setValue(data.bowl_movememnt_trend);
          this.ProfileForm!.get('normal_stool_form')!.setValue(data.normal_stool_form);
          this.ProfileForm!.get('work_stress_index')!.setValue(data.work_stress_index);
          this.ProfileForm!.get('meanstation_cycle')!.setValue(data.meanstation_cycle);
          if (data.food_test_preference.length > 0) {
            this.selectedOptions = data.food_test_preference;
            this.options.forEach((option) => {
              option.selected = data.food_test_preference.includes(option.value);
              const checkbox = document.querySelector(
                `input[value="${option.value}"]`,
              ) as HTMLInputElement;
              if (checkbox) {
                checkbox.checked = option.selected;
              }
            });
          }
        }
        if (method !== 'GET') {
          this.loading = false;
          alert('Your information has been submitted successfully.');
          window.location.reload();
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
  submitProfile() {
    let method = 'POST';
    if (this.profilePatch) {
      method = 'PATCH';
    }
    console.log(this.ProfileForm.value, 'data');

    const date = this.formatDate(this.ProfileForm.value.birth_date);
    console.log(this.calculatedBodyMass, 'date');
    const data = {
      first_name: this.ProfileForm.value.first_name,
      last_name: this.ProfileForm.value.last_name,
      birth_date: date,
      gender: this.ProfileForm.value.gender,
      acr: this.dailyCalorie > 0 ? this.dailyCalorie : null,
      bcr: this.bseCalorie > 0 ? this.bseCalorie : null,
      bmi: this.BMI > 0 ? this.BMI : null,
      id: localStorage.getItem('user_id') || '',
      weight: this.ProfileForm.value.weight,
      height: this.ProfileForm.value.height,
      body_fat: this.ProfileForm.value.body_fat,
      body_mass:
        this.calculatedBodyMass !== undefined && this.calculatedBodyMass !== null
          ? this.calculatedBodyMass.toString()
          : null,
      waist: this.ProfileForm.value.waist,
      hips: this.ProfileForm.value.hips,
      activity_level: this.ProfileForm.value.activity_level,
      sleep_time:
        this.ProfileForm.value.sleep_time !== null ? this.ProfileForm.value.sleep_time : null,
      wakeup_time:
        this.ProfileForm.value.wakeup_time !== null ? this.ProfileForm.value.wakeup_time : null,
      sleep_quality: this.ProfileForm.value.sleep_quality,
      family_history: this.ProfileForm.value.family_history,
      regular_medicine: this.ProfileForm.value.regular_medicine,
      cronical_information: this.ProfileForm.value.cronical_information,
      food_allergy: this.ProfileForm.value.food_allergy,
      food_test_preference: this.selectedOptions,
      bowl_movememnt_trend: this.ProfileForm.value.bowl_movememnt_trend,
      normal_stool_form: this.ProfileForm.value.normal_stool_form,
      work_stress_index: this.ProfileForm.value.work_stress_index,
      meanstation_cycle: this.ProfileForm.value.meanstation_cycle,
    };

    this.getProfileData(method, data);
  }
  formatDate(dateString: string | number | Date) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
