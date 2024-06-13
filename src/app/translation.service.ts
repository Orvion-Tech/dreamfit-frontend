import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  constructor(
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.translate.setDefaultLang('en');
    this.initLanguageChange();
  }

  initLanguageChange() {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      const lang = this.route.snapshot.paramMap.get('lang');
      this.setLanguage(lang || 'en'); // Default to English if language is not specified
    });
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
  }

  changeLanguage(lang: string) {
    this.router.navigate([lang]);
  }
}
