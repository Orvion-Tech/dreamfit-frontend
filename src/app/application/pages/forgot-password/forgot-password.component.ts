import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AbortControllerService } from '../../../abort-controller.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotpasswordForm: FormGroup;
  phoneNumber = false;
  otp = false;
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
    this.forgotpasswordForm = this.fb.group({
      phone_number: ['', [Validators.required, Validators.pattern(/^\d{8,10}$/)]],
      otp: ['', [Validators.required, Validators.pattern(/^\d{4}$/)]],
      country_code: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', [Validators.required]],
    });
  }
  passwordMatchValidator() {
    const passwordCont = this.forgotpasswordForm.get('password');
    const confirmPasswordCont = this.forgotpasswordForm.get('confirmPassword');
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
    if (this.forgotpasswordForm.valid) {
      const credentials = {
        password: this.forgotpasswordForm.value.password,
        phone_number:
          this.forgotpasswordForm.get('country_code')!.value +
          this.forgotpasswordForm.get('phone_number')!.value,
        forget_password: true,
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
      const passwordCont = this.forgotpasswordForm.get('password');
      const confirmPasswordCont = this.forgotpasswordForm.get('confirmPassword');
      if (passwordCont) {
        this.password = passwordCont.invalid;
      }
      if (confirmPasswordCont) {
        this.phoneNumber = confirmPasswordCont.invalid;
      }
    }
  }
  async verifyOTP() {
    this.otp = true;
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    if (
      this.forgotpasswordForm.get('phone_number')!.valid &&
      this.forgotpasswordForm.get('otp')!.valid
    ) {
      try {
        const response = await fetch('https://admin.dreamfithk.com/en/api/verify-forgotpass-otp/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number:
              this.forgotpasswordForm.get('country_code')!.value +
              this.forgotpasswordForm.get('phone_number')!.value,
            otp: this.forgotpasswordForm.get('otp')!.value,
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
      const otpCont = this.forgotpasswordForm.get('otp');
      if (otpCont) {
        this.otp = otpCont.invalid;
      }
    }
  }
  async sendOTP() {
    this.countryCode = true;
    this.phoneNumber = true;
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    if (
      this.forgotpasswordForm.get('country_code')!.valid &&
      this.forgotpasswordForm.get('phone_number')!.valid
    ) {
      try {
        const response = await fetch('https://admin.dreamfithk.com/en/api/send-forgotpass-otp/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone_number:
              this.forgotpasswordForm.get('country_code')!.value +
              this.forgotpasswordForm.get('phone_number')!.value,
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
      const countryCode = this.forgotpasswordForm.get('country_code');
      const usernameCont = this.forgotpasswordForm.get('phone_number');
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
    this.phoneNumber = false;
    this.password = false;
    this.confirmPassword = false;
    this.otp = false;
    this.passwordMismatch = false;
  }
}
