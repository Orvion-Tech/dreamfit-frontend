import { Component } from '@angular/core';

@Component({
  selector: 'app-meal-summary',
  templateUrl: './meal-summary.component.html',
  styleUrls: ['./meal-summary.component.scss'],
})
export class MealSummaryComponent {
  showExportPopup = false;
  showExport() {
    this.showExportPopup = true;
  }
  hideExport() {
    this.showExportPopup = false;
  }
}
