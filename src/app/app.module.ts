import { NgModule, importProvidersFrom } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { HttpClientModule, provideHttpClient, HttpClient } from '@angular/common/http';
import { MatInputModule } from '@angular/material/input';
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
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MatNativeDateModule,
} from '@angular/material/core';
import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MAT_MOMENT_DATE_FORMATS,
} from '@angular/material-moment-adapter';
import { TranslationService } from './translation.service';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { LanguageSelectorComponent } from './application/components/language-selector/language-selector.component';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, '../assets/i18n/', '.json');
}
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
    LanguageSelectorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    MatDatepickerModule,
    MatInputModule,
    MatFormFieldModule,
    MatNativeDateModule,
    BrowserAnimationsModule,
    ImageCropperModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
  ],
  providers: [
    provideAnimations(),
    provideHttpClient(),
    importProvidersFrom(MatNativeDateModule),
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    TranslationService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
