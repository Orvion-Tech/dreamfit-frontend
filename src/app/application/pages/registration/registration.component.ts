import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbortControllerService } from '../../../abort-controller.service';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss'],
})
export class RegistrationComponent {
  registrationForm: FormGroup;
  phoneNumber = false;
  otp = false;
  invitationCode = false;
  password = false;
  confirmPassword = false;
  otpSent = false;
  otpVerified = false;
  countryCode = false;
  passwordMismatch = false;
  constructor(
    private fb: FormBuilder,
    private abortControllerService: AbortControllerService,
  ) {
    this.registrationForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      country_code: ['', Validators.required],
      invitation_code: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required]],
    });
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
        const response = await fetch(
          'https://dssv33z9c6vvp.cloudfront.net/en/api/user-registration/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
            signal: abortController.signal,
          },
        );
        if (response.ok) {
          const data = await response.json();
          const user_id = data.user_id;
          // const now: any = new Date().getTime();
          // localStorage.setItem('token_timestamp', now);
          localStorage.setItem('id_token', data.token.access);
          localStorage.setItem('user_id', user_id);
          window.location.replace('/home');
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
      this.registrationForm.get('invitation_code')!.valid
    ) {
      try {
        const response = await fetch('https://dssv33z9c6vvp.cloudfront.net/en/api/verify-otp/', {
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
      if (otpCont) {
        this.otp = otpCont.invalid;
      }
      if (invitationCodeCont) {
        this.invitationCode = invitationCodeCont.invalid;
      }
    }
  }
  async sendOTP() {
    this.countryCode = true;
    this.phoneNumber = true;
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    if (
      this.registrationForm.get('country_code')!.valid &&
      this.registrationForm.get('phone_number')!.valid
    ) {
      try {
        const response = await fetch('https://dssv33z9c6vvp.cloudfront.net/en/api/send-otp/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number:
              this.registrationForm.get('country_code')!.value +
              this.registrationForm.get('phone_number')!.value,
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
      const usernameCont = this.registrationForm.get('phone_number');
      if (countryCode) {
        this.countryCode = countryCode.invalid;
      }
      if (usernameCont) {
        this.phoneNumber = usernameCont.invalid;
      }
    }
  }
  resetError() {
    this.countryCode = false;
    this.invitationCode = false;
    this.phoneNumber = false;
    this.password = false;
    this.confirmPassword = false;
    this.otp = false;
    this.passwordMismatch = false;
  }
}
