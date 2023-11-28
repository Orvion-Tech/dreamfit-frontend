import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  showPersonal = false;
  showMeal = false;
  showMealForm = false;
  mealType = '';
  personalClick() {
    this.showPersonal = !this.showPersonal;
  }
  mealClick() {
    this.showMeal = !this.showMeal;
  }
  showMealFormClick(data: string) {
    this.mealType = data;
    this.showMealForm = true;
  }
  hideMeal() {
    this.showMealForm = false;
  }
}
