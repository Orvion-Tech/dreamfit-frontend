import { NgModule } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { ProfileComponent } from './application/pages/profile/profile.component';
import { TrendComponent } from './application/pages/trend/trend.component';
import { CalenderComponent } from './application/pages/calender/calender.component';
import { MealSummaryComponent } from './application/pages/meal-summary/meal-summary.component';
import { ImageUploadComponent } from './application/components/image-upload/image-upload.component';
import { ImageCropperModule } from 'ngx-image-cropper';
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
    ProfileComponent,
    TrendComponent,
    CalenderComponent,
    MealSummaryComponent,
    ImageUploadComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    ImageCropperModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
