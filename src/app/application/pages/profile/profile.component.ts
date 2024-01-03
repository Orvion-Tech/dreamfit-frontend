/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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
    this.getProfileData('GET', null);
  }
  constructor(private fb: FormBuilder) {
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
    let url = `http://192.168.1.103/api/profile/`;
    const data = postData;
    if (method === 'PATCH') {
      url = `http://192.168.1.103/api/profile/${this.profileId}/`;
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
        const profileData = await response.json();
        console.log(profileData);
        if (profileData[0].id !== undefined && profileData[0].id !== null) {
          if (profileData[0].user.user_image) {
            this.profileImage = profileData[0].user.user_image;
          }
          if (profileData[0].bmi !== null) {
            this.BMI = profileData[0].bmi;
          }
          if (profileData[0].bcr !== null) {
            this.bseCalorie = profileData[0].bcr;
          }
          if (profileData[0].acr !== null) {
            this.dailyCalorie = profileData[0].acr;
          }
          this.profilePatch = true;
          this.profileId = profileData[0].id;
          this.ProfileForm!.get('first_name')!.setValue(profileData[0].user.first_name);
          this.ProfileForm!.get('last_name')!.setValue(profileData[0].user.last_name);
          this.ProfileForm!.get('birth_date')!.setValue(profileData[0].user.birth_date);
          this.ProfileForm!.get('gender')!.setValue(profileData[0].user.gender);
          this.ProfileForm!.get('user_image')!.setValue(profileData[0].user.user_image);
          this.ProfileForm!.get('body_fat')!.setValue(profileData[0].body_fat);
          this.ProfileForm!.get('body_mass')!.setValue(profileData[0].body_mass);
          this.ProfileForm!.get('waist')!.setValue(profileData[0].waist);
          this.ProfileForm!.get('hips')!.setValue(profileData[0].hips);
          this.ProfileForm!.get('activity_level')!.setValue(profileData[0].activity_level);
          this.ProfileForm!.get('sleep_time')!.setValue(profileData[0].sleep_time);
          this.ProfileForm!.get('wakeup_time')!.setValue(profileData[0].wakeup_time);
          this.ProfileForm!.get('sleep_quality')!.setValue(profileData[0].sleep_quality);
          this.ProfileForm!.get('family_history')!.setValue(profileData[0].family_history);
          this.ProfileForm!.get('regular_medicine')!.setValue(profileData[0].regular_medicine);
          this.ProfileForm!.get('food_allergy')!.setValue(profileData[0].food_allergy);
          this.ProfileForm!.get('bowl_movememnt_trend')!.setValue(
            profileData[0].bowl_movememnt_trend,
          );
          this.ProfileForm!.get('normal_stool_form')!.setValue(profileData[0].normal_stool_form);
          this.ProfileForm!.get('work_stress_index')!.setValue(profileData[0].work_stress_index);
          this.ProfileForm!.get('meanstation_cycle')!.setValue(profileData[0].meanstation_cycle);
          if (profileData[0].food_test_preference.length > 0) {
            this.selectedOptions = profileData[0].food_test_preference;
            this.options.forEach((option) => {
              option.selected = profileData[0].food_test_preference.includes(option.value);
              const checkbox = document.querySelector(
                `input[value="${option.value}"]`,
              ) as HTMLInputElement;
              if (checkbox) {
                checkbox.checked = option.selected;
              }
            });
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
  async getProfileData(method: string, postData: any | null | undefined) {
    let url = `http://192.168.1.103/api/profile/`;
    let data = postData;
    if (method === 'GET') {
      data = null;
    }
    if (method === 'PATCH') {
      url = `http://192.168.1.103/api/profile/${this.profileId}/`;
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
        const profileData = await response.json();
        console.log(profileData);
        if (profileData[0].id !== undefined && profileData[0].id !== null) {
          if (profileData[0].user.user_image) {
            this.profileImage = profileData[0].user.user_image;
          }
          if (profileData[0].bmi !== null) {
            this.BMI = profileData[0].bmi;
          }
          if (profileData[0].bcr !== null) {
            this.bseCalorie = profileData[0].bcr;
          }
          if (profileData[0].acr !== null) {
            this.dailyCalorie = profileData[0].acr;
          }
          this.profilePatch = true;
          this.profileId = profileData[0].id;
          this.ProfileForm!.get('first_name')!.setValue(profileData[0].user.first_name);
          this.ProfileForm!.get('last_name')!.setValue(profileData[0].user.last_name);
          this.ProfileForm!.get('birth_date')!.setValue(profileData[0].user.birth_date);
          this.ProfileForm!.get('gender')!.setValue(profileData[0].user.gender);
          this.ProfileForm!.get('user_image')!.setValue(profileData[0].user.user_image);
          this.ProfileForm!.get('body_fat')!.setValue(profileData[0].body_fat);
          this.ProfileForm!.get('body_mass')!.setValue(profileData[0].body_mass);
          this.ProfileForm!.get('waist')!.setValue(profileData[0].waist);
          this.ProfileForm!.get('hips')!.setValue(profileData[0].hips);
          this.ProfileForm!.get('activity_level')!.setValue(profileData[0].activity_level);
          this.ProfileForm!.get('sleep_time')!.setValue(profileData[0].sleep_time);
          this.ProfileForm!.get('wakeup_time')!.setValue(profileData[0].wakeup_time);
          this.ProfileForm!.get('sleep_quality')!.setValue(profileData[0].sleep_quality);
          this.ProfileForm!.get('family_history')!.setValue(profileData[0].family_history);
          this.ProfileForm!.get('regular_medicine')!.setValue(profileData[0].regular_medicine);
          this.ProfileForm!.get('food_allergy')!.setValue(profileData[0].food_allergy);
          this.ProfileForm!.get('bowl_movememnt_trend')!.setValue(
            profileData[0].bowl_movememnt_trend,
          );
          this.ProfileForm!.get('normal_stool_form')!.setValue(profileData[0].normal_stool_form);
          this.ProfileForm!.get('work_stress_index')!.setValue(profileData[0].work_stress_index);
          this.ProfileForm!.get('meanstation_cycle')!.setValue(profileData[0].meanstation_cycle);
          if (profileData[0].food_test_preference.length > 0) {
            this.selectedOptions = profileData[0].food_test_preference;
            this.options.forEach((option) => {
              option.selected = profileData[0].food_test_preference.includes(option.value);
              const checkbox = document.querySelector(
                `input[value="${option.value}"]`,
              ) as HTMLInputElement;
              if (checkbox) {
                checkbox.checked = option.selected;
              }
            });
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
