import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomepageComponent } from './homepage/homepage.component';
import { LoginComponent } from './application/pages/login/login.component';
import { SplashComponent } from './application/pages/splash/splash.component';

@NgModule({
  declarations: [AppComponent, HomepageComponent, LoginComponent, SplashComponent],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
