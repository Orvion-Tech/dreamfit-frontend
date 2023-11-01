import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './application/pages/login/login.component';
const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' }, // Default route redirects to '/home'
  { path: 'home', component: HomepageComponent },
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
