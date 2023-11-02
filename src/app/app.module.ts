import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './application/pages/login/login.component';
import { SplashComponent } from './application/pages/splash/splash.component';
import { ForgotPasswordComponent } from './application/pages/forgot-password/forgot-password.component';
import { RegistrationComponent } from './application/pages/registration/registration.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginComponent,
    SplashComponent,
    ForgotPasswordComponent,
    RegistrationComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
