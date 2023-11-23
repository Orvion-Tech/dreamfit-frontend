import { Component, Renderer2, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  showMenu = false;
  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
  ) {}
  redirect = false;

  ngOnInit() {
    const idToken = localStorage.getItem('id_token');
    const userId = localStorage.getItem('user_id');
    if (idToken && userId) {
      this.redirect = true; // Allow access to the route
    } else {
      this.redirect = false;
    }
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
