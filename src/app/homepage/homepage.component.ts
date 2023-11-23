import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-homepage',
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.scss'],
})
export class HomepageComponent {
  showMenu = false;
  constructor(private renderer: Renderer2) {}

  showMenuFn() {
    this.showMenu = !this.showMenu;

    if (this.showMenu) {
      this.renderer.addClass(document.body, 'noscroll');
    } else {
      this.renderer.removeClass(document.body, 'noscroll');
    }
  }
}
