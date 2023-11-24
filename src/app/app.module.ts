import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './application/pages/login/login.component';
import { SplashComponent } from './application/pages/splash/splash.component';
import { ForgotPasswordComponent } from './application/pages/forgot-password/forgot-password.component';
import { RegistrationComponent } from './application/pages/registration/registration.component';
import { StatusComponent } from './application/pages/status/status.component';
import { FormsModule } from '@angular/forms';
import { HomeComponent } from './application/pages/home/home.component';
import { AppHeaderComponent } from './application/components/app-header/app-header.component';
import { AppFooterComponent } from './application/components/app-footer/app-footer.component';
import { HeaderComponent } from './application/components/header/header.component';

@NgModule({
  declarations: [
    AppComponent,
    HomepageComponent,
    LoginComponent,
    SplashComponent,
    ForgotPasswordComponent,
    RegistrationComponent,
    StatusComponent,
    HomeComponent,
    AppHeaderComponent,
    AppFooterComponent,
    HeaderComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, ReactiveFormsModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
