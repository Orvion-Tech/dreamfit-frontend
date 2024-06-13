import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './application/pages/login/login.component';
import { ForgotPasswordComponent } from './application/pages/forgot-password/forgot-password.component';
import { RegistrationComponent } from './application/pages/registration/registration.component';
import { HomeComponent } from './application/pages/home/home.component';
import { ProfileComponent } from './application/pages/profile/profile.component';
import { TrendComponent } from './application/pages/trend/trend.component';
import { CalenderComponent } from './application/pages/calender/calender.component';
import { MealSummaryComponent } from './application/pages/meal-summary/meal-summary.component';
import { TranslationService } from './translation.service'; // Import TranslationService

const routes: Routes = [
  { path: ':lang', component: HomeComponent }, // Route with language parameter
  { path: ':lang/login', component: LoginComponent },
  { path: ':lang/forgot-password', component: ForgotPasswordComponent },
  { path: ':lang/registration', component: RegistrationComponent },
  { path: ':lang/home', component: HomeComponent },
  { path: ':lang/profile', component: ProfileComponent },
  { path: ':lang/trend', component: TrendComponent },
  { path: ':lang/calender', component: CalenderComponent },
  { path: ':lang/meal-summary', component: MealSummaryComponent },
  { path: '**', redirectTo: '/en' }, // Redirect to English for invalid URLs
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
  constructor(private translationService: TranslationService) {
    // Set default language when the app initializes
    this.translationService.setLanguage('en'); // Default language is English
  }
}
