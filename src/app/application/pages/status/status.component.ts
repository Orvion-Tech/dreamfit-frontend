import { Component } from '@angular/core';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
})
export class StatusComponent {
  showMenu = false;
  isChecked: boolean = false;

  toggleChanged() {
    this.isChecked = !this.isChecked;
  }
}
