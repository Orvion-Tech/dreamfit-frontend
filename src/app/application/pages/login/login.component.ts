import { Component, OnInit } from '@angular/core';
import { AbortControllerService } from '../../../abort-controller.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  countryCode = false;
  phoneNumber = false;
  password = false;

  constructor(
    private fb: FormBuilder,
    private abortControllerService: AbortControllerService,
  ) {
    this.loginForm = this.fb.group({
      country_code: ['', Validators.required],
      phone_number: ['', [Validators.required]],
      password: ['', Validators.required],
    });
  }
  ngOnInit(): void {
    console.log('test');
    const idToken: string | null = localStorage.getItem('id_token');
    const userId: string | null = localStorage.getItem('user_id');
    console.log(idToken, userId);
    if (idToken && userId) {
      window.location.href = '/home';
    }
  }
  async onSubmit() {
    this.countryCode = true;
    this.password = true;
    this.phoneNumber = true;
    this.abortControllerService.abortExistingRequest();
    const abortController = this.abortControllerService.createAbortController();
    if (this.loginForm.valid) {
      const credentials = {
        phone_number: this.loginForm.value.country_code + this.loginForm.value.phone_number,
        password: this.loginForm.value.password,
      };
      try {
        const response = await fetch('https://admin.dreamfithk.com/en/api/login/', {
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
          localStorage.setItem('id_token', data.token.access);
          localStorage.setItem('user_id', user_id);
          const now: number = new Date().getTime();
          localStorage.setItem('token_timestamp', now.toString());
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
      const usernameCont = this.loginForm.get('phone_number');
      const countryCodeCont = this.loginForm.get('country_code');
      const passwordCont = this.loginForm.get('password');
      if (usernameCont) {
        this.phoneNumber = usernameCont.invalid;
      }
      if (countryCodeCont) {
        this.countryCode = countryCodeCont.invalid;
      }
      if (passwordCont) {
        this.password = passwordCont.invalid;
      }
    }
  }
  resetError() {
    this.phoneNumber = false;
    this.countryCode = false;
    this.password = false;
  }
}
