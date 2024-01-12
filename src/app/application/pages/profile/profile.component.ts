/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AbortControllerService } from '../../../abort-controller.service';
import { Router } from '@angular/router';
import { TokenService } from '../../../token.service';
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
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
      const maxFileSizeInBytes = 1 * 1024 * 1024;
      if (file && file.size > maxFileSizeInBytes) {
        this.ProfileForm.get(controlName)?.setErrors({ fileSizeExceeded: true });

        // alert('File size exceeds the limit (1MB). Please select a smaller file.');
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
    let url = `http://192.168.1.103/en/api/profile/`;
    const data = postData;
    if (method === 'PATCH') {
      url = `http://192.168.1.103/en/api/profile/${this.profileId}/`;
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
          if (data.bmi !== null) {
            this.BMI = data.bmi;
          }
          if (data.bcr !== null) {
            this.bseCalorie = data.bcr;
          }
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
          this.ProfileForm!.get('body_fat')!.setValue(data.body_fat);
          this.ProfileForm!.get('body_mass')!.setValue(data.body_mass);
          this.ProfileForm!.get('waist')!.setValue(data.waist);
          this.ProfileForm!.get('hips')!.setValue(data.hips);
          this.ProfileForm!.get('activity_level')!.setValue(data.activity_level);
          this.ProfileForm!.get('sleep_time')!.setValue(data.sleep_time);
          this.ProfileForm!.get('wakeup_time')!.setValue(data.wakeup_time);
          this.ProfileForm!.get('sleep_quality')!.setValue(data.sleep_quality);
          this.ProfileForm!.get('family_history')!.setValue(data.family_history);
          this.ProfileForm!.get('regular_medicine')!.setValue(data.regular_medicine);
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
    let url = `http://192.168.1.103/en/api/profile/`;
    let data = postData;
    if (method === 'GET') {
      data = null;
    }
    if (method === 'PATCH') {
      url = `http://192.168.1.103/en/api/profile/${this.profileId}/`;
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
          if (data.bmi !== null) {
            this.BMI = data.bmi;
          }
          if (data.bcr !== null) {
            this.bseCalorie = data.bcr;
          }
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
          this.ProfileForm!.get('body_fat')!.setValue(data.body_fat);
          this.ProfileForm!.get('body_mass')!.setValue(data.body_mass);
          this.ProfileForm!.get('waist')!.setValue(data.waist);
          this.ProfileForm!.get('hips')!.setValue(data.hips);
          this.ProfileForm!.get('activity_level')!.setValue(data.activity_level);
          this.ProfileForm!.get('sleep_time')!.setValue(data.sleep_time);
          this.ProfileForm!.get('wakeup_time')!.setValue(data.wakeup_time);
          this.ProfileForm!.get('sleep_quality')!.setValue(data.sleep_quality);
          this.ProfileForm!.get('family_history')!.setValue(data.family_history);
          this.ProfileForm!.get('regular_medicine')!.setValue(data.regular_medicine);
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
    console.log(this.selectedOptions, 'check');
    let method = 'POST';
    if (this.profilePatch) {
      method = 'PATCH';
    }

    // const formData = new FormData();
    // formData.append('first_name', this.ProfileForm.value.first_name);
    // formData.append('last_name', this.ProfileForm.value.last_name);
    // formData.append('birth_date', this.ProfileForm.value.birth_date);
    // formData.append('gender', this.ProfileForm.value.gender);
    // formData.append('id', localStorage.getItem('user_id') || '');
    // formData.append('body_fat', this.ProfileForm.value.body_fat);
    // formData.append('body_mass', this.ProfileForm.value.body_mass);
    // formData.append('waist', this.ProfileForm.value.waist);
    // formData.append('hips', this.ProfileForm.value.hips);
    // formData.append('activity_level', this.ProfileForm.value.activity_level);
    // formData.append('sleep_time', this.ProfileForm.value.sleep_time);
    // formData.append('wakeup_time', this.ProfileForm.value.wakeup_time);
    // formData.append('sleep_quality', this.ProfileForm.value.sleep_quality);
    // formData.append('family_history', this.ProfileForm.value.family_history);
    // formData.append('regular_medicine', this.ProfileForm.value.regular_medicine);
    // formData.append('food_allergy', this.ProfileForm.value.food_allergy);
    // formData.append('food_test_preference', JSON.stringify(this.selectedOptions));
    // formData.append('bowl_movememnt_trend', this.ProfileForm.value.bowl_movememnt_trend);
    // formData.append('normal_stool_form', this.ProfileForm.value.normal_stool_form);
    // formData.append('work_stress_index', this.ProfileForm.value.work_stress_index);
    // if (this.ProfileForm.value.meanstation_cycle == 'true') {
    //   formData.append('meanstation_cycle', this.ProfileForm.value.meanstation_cycle);
    // }
    const data = {
      first_name: this.ProfileForm.value.first_name,
      last_name: this.ProfileForm.value.last_name,
      birth_date: this.ProfileForm.value.birth_date,
      gender: this.ProfileForm.value.gender,
      id: localStorage.getItem('user_id') || '',
      body_fat: this.ProfileForm.value.body_fat,
      body_mass: this.ProfileForm.value.body_mass,
      waist: this.ProfileForm.value.waist,
      hips: this.ProfileForm.value.hips,
      activity_level: this.ProfileForm.value.activity_level,
      sleep_time: this.ProfileForm.value.sleep_time,
      wakeup_time: this.ProfileForm.value.wakeup_time,
      sleep_quality: this.ProfileForm.value.sleep_quality,
      family_history: this.ProfileForm.value.family_history,
      regular_medicine: this.ProfileForm.value.regular_medicine,
      food_allergy: this.ProfileForm.value.food_allergy,
      food_test_preference: this.selectedOptions,
      bowl_movememnt_trend: this.ProfileForm.value.bowl_movememnt_trend,
      normal_stool_form: this.ProfileForm.value.normal_stool_form,
      work_stress_index: this.ProfileForm.value.work_stress_index,
      meanstation_cycle: this.ProfileForm.value.meanstation_cycle,
    };
    console.log(data, 'data');

    this.getProfileData(method, data);
  }
}
