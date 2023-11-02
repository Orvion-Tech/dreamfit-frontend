import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './application/pages/login/login.component';
import { ForgotPasswordComponent } from './application/pages/forgot-password/forgot-password.component';
import { VerificationComponent } from './application/pages/verification/verification.component';
import { NewPasswordComponent } from './application/pages/new-password/new-password.component';
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route redirects to '/home'
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'verification', component: VerificationComponent },
  { path: 'new-password', component: NewPasswordComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
