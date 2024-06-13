// import { Component, OnInit } from '@angular/core';
// import { Router } from '@angular/router';
// import { TranslationService } from '../../../translation.service';

// @Component({
//   selector: 'app-language-selector',
//   templateUrl: './language-selector.component.html',
//   styleUrls: ['./language-selector.component.scss'],
// })
// export class LanguageSelectorComponent implements OnInit {
//   constructor(
//     private translationService: TranslationService,
//     private router: Router,
//   ) {}
//   ngOnInit() {
//     const currentLang = this.router.url.includes('/zh') ? 'zh' : 'en';
//     this.translationService.setLanguage(currentLang);
//   }
//   onChangeLanguage(event: Event) {
//     const target = event.target as HTMLSelectElement;
//     if (target) {
//       const lang = target.value;
//       this.translationService.setLanguage(lang);
//       this.router.navigate([lang]);
//     }
//   }
//   isLanguageSelected(lang: string): boolean {
//     return this.router.url === `/${lang}`;
//   }
// }
import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslationService } from '../../../translation.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss'],
})
export class LanguageSelectorComponent implements OnInit {
  currentLang: string = 'en';

  constructor(
    private translationService: TranslationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.currentLang = params['lang'] || 'en';
      this.translationService.setLanguage(this.currentLang);
    });
  }

  onChangeLanguage(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target) {
      const lang = target.value;
      const urlTree = this.router.parseUrl(this.router.url);
      urlTree.root.children['primary'].segments[0].path = lang;
      this.router.navigateByUrl(urlTree);
      this.translationService.setLanguage(lang);
    }
  }

  isLanguageSelected(lang: string): boolean {
    return this.currentLang === lang;
  }
}
