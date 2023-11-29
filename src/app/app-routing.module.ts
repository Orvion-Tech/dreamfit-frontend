import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './application/pages/login/login.component';
import { ForgotPasswordComponent } from './application/pages/forgot-password/forgot-password.component';
import { RegistrationComponent } from './application/pages/registration/registration.component';
import { HomeComponent } from './application/pages/home/home.component';
import { ProfileComponent } from './application/pages/profile/profile.component';
import { TrendComponent } from './application/pages/trend/trend.component';
import { CalenderComponent } from './application/pages/calender/calender.component';
import { MealSummaryComponent } from './application/pages/meal-summary/meal-summary.component';

const routes: Routes = [
  // { path: '', redirectTo: '/', pathMatch: 'full' }, // Default route redirects to '/home'
  { path: '', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'trend', component: TrendComponent },
  { path: 'calender', component: CalenderComponent },
  { path: 'meal-summary', component: MealSummaryComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
