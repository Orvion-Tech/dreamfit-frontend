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
  selectedFile: File | undefined;
  uploadedFiles: File[] = [];
  fileChangeEvent(uploadedFile: File) {
    this.uploadedFiles.push(uploadedFile);
    console.log(this.uploadedFiles);
  }
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
  deleteLastFile(index: number) {
    // Implementation to delete the file at the specified index from the array
    this.uploadedFiles.splice(index, 1);
  }
}
