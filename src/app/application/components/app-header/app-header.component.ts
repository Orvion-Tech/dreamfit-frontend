import { Component, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent {
  showMenu = false;
  constructor(private renderer: Renderer2) {}
  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('id_token');
    localStorage.removeItem('token_timestamp');
    window.location.replace('/');
  }
  showMenuFn() {
    this.showMenu = !this.showMenu;

    if (this.showMenu) {
      this.renderer.addClass(document.body, 'noscroll');
    } else {
      this.renderer.removeClass(document.body, 'noscroll');
    }
  }
}
