import { Component, Renderer2, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-app-header',
  templateUrl: './app-header.component.html',
  styleUrls: ['./app-header.component.scss'],
})
export class AppHeaderComponent implements OnInit {
  showMenu = false;
  currentLang: string = 'en';

  constructor(
    private renderer: Renderer2,
    private route: ActivatedRoute,
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.currentLang = params['lang'] || 'en';
    });
  }
  logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('id_token');
    localStorage.removeItem('token_timestamp');
    window.location.replace('/' + this.currentLang);
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
