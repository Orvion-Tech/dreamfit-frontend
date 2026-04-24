import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbortControllerService } from '../../../abort-controller.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  phoneNumber = false;
  email = false;
  otp = false;
  invitationCode = false;
  password = false;
  confirmPassword = false;
  otpSent = false;
  otpVerified = false;
  countryCode = false;
  passwordMismatch = false;
  currentLang: string = 'en';
  userClassOptions: { key: string | number; value: string }[] = [];
  userClassLoading = false;
  userClassError = '';
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private abortControllerService: AbortControllerService,
  ) {
    this.registrationForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^[\d]{8,10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      otp: ['', [Validators.required, Validators.pattern(/^[\d]{4}$/)]],
      country_code: ['', Validators.required],
      invitation_code: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required]],
      user_class: ['', Validators.required],
    });
  }
  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.currentLang = params['lang'] || 'en';
    });
    this.fetchUserClassOptions();
  }

  async fetchUserClassOptions() {
    this.userClassLoading = true;
    this.userClassError = '';
    try {
      const response = await fetch('https://admin.dreamfithk.com/en/api/user-class-options/');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          this.userClassOptions = data;
        } else if (Array.isArray(data?.options)) {
          this.userClassOptions = data.options;
        } else {
          this.userClassOptions = [];
        }
      } else {
        this.userClassError = 'Failed to load class options.';
      }
    } catch (error) {
      this.userClassError = 'Error loading class options.';
    } finally {
      this.userClassLoading = false;
    }
  }
  passwordMatchValidator() {
    const passwordCont = this.registrationForm.get('password');
    const confirmPasswordCont = this.registrationForm.get('confirmPassword');
    if (passwordCont && confirmPasswordCont) {
      const password = passwordCont.value;
      const confirmPassword = confirmPasswordCont.value;
      return password === confirmPassword ? null : (this.passwordMismatch = true);
    } else {
      return (this.passwordMismatch = true);
    }
  }
  async onSubmit() {
    if (this.passwordMatchValidator()) {
      return;
    }
    this.password = true;
    this.confirmPassword = true;
    if (this.registrationForm.valid) {
      const credentials = {
        password: this.registrationForm.value.password,
        phone_number:
          this.registrationForm.get('country_code')!.value +
          this.registrationForm.get('phone_number')!.value,
      };
      this.abortControllerService.abortExistingRequest();
      const abortController = this.abortControllerService.createAbortController();
      try {
        const response = await fetch('https://admin.dreamfithk.com/en/api/user-registration/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(credentials),
          signal: abortController.signal,
        });
        if (response.ok) {
          const data = await response.json();
          const user_id = data.user_id;
          // const now: any = new Date().getTime();
          // localStorage.setItem('token_timestamp', now);
          localStorage.setItem('id_token', data.token.access);
          localStorage.setItem('user_id', user_id);
          window.location.replace(`${this.currentLang}/home`);
          this.abortControllerService.resetAbortController();

          // window.location.replace('/account');
        } else {
          const data = await response.json();
          this.abortControllerService.resetAbortController();
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      const passwordCont = this.registrationForm.get('password');
      const confirmPasswordCont = this.registrationForm.get('confirmPassword');
      if (passwordCont) {
        this.password = passwordCont.invalid;
      }
      if (confirmPasswordCont) {
        this.phoneNumber = confirmPasswordCont.invalid;
      }
    }
  }
  async verifyOTP() {
    this.invitationCode = true;
    this.otp = true;
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    if (
      this.registrationForm.get('phone_number')!.valid &&
      this.registrationForm.get('otp')!.valid &&
      this.registrationForm.get('invitation_code')!.valid &&
      this.registrationForm.get('user_class')!.valid
    ) {
      try {
        const response = await fetch('https://admin.dreamfithk.com/en/api/verify-otp/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number:
              this.registrationForm.get('country_code')!.value +
              this.registrationForm.get('phone_number')!.value,
            otp: this.registrationForm.get('otp')!.value,
            invitation_code: this.registrationForm.get('invitation_code')!.value,
            user_class: String(this.registrationForm.get('user_class')!.value),
          }),
          signal: abortController.signal,
        });

        if (response.ok) {
          // const data = await response.json();
          this.otpVerified = true;
          this.abortControllerService.resetAbortController();
          console.log('Authentication successful');
        } else {
          const data = await response.json();
          this.abortControllerService.resetAbortController();
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      const invitationCodeCont = this.registrationForm.get('invitation_code');
      const otpCont = this.registrationForm.get('otp');
      const userClassCont = this.registrationForm.get('user_class');
      if (otpCont) {
        this.otp = otpCont.invalid;
      }
      if (invitationCodeCont) {
        this.invitationCode = invitationCodeCont.invalid;
      }
      if (userClassCont) {
        userClassCont.markAsTouched();
      }
    }
  }
  async sendOTP() {
    this.countryCode = true;
    this.phoneNumber = true;
    this.email = true;
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    if (
      this.registrationForm.get('country_code')!.valid &&
      this.registrationForm.get('phone_number')!.valid &&
      this.registrationForm.get('email')!.valid
    ) {
      try {
        const response = await fetch('https://admin.dreamfithk.com/en/api/send-otp/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number:
              this.registrationForm.get('country_code')!.value +
              this.registrationForm.get('phone_number')!.value,
            email: this.registrationForm.get('email')!.value,
          }),
          signal: abortController.signal,
        });

        if (response.ok) {
          // const data = await response.json();
          this.otpSent = true;
          this.abortControllerService.resetAbortController();
          console.log('Authentication successful');
        } else {
          const data = await response.json();
          this.abortControllerService.resetAbortController();
          alert(data.message);
        }
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      const countryCode = this.registrationForm.get('country_code');
      const phoneNumberCont = this.registrationForm.get('phone_number');
      const emailCont = this.registrationForm.get('email');
      if (countryCode) {
        this.countryCode = countryCode.invalid;
      }
      if (phoneNumberCont) {
        this.phoneNumber = phoneNumberCont.invalid;
      }
      if (emailCont) {
        this.email = emailCont.invalid;
      }
    }
  }
  resetError() {
    this.countryCode = false;
    this.invitationCode = false;
    this.phoneNumber = false;
    this.email = false;
    this.password = false;
    this.confirmPassword = false;
    this.otp = false;
    this.passwordMismatch = false;
    this.userClassError = '';
  }
}
