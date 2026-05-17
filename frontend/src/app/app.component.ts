import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutComponent } from './shared/layout/layout.component';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LayoutComponent],
  template: `<app-layout><router-outlet /></app-layout>`,
})
export class AppComponent {
  title = 'Crop Predict';

  constructor(private langService: LanguageService) {
    // Eagerly instantiates the LanguageService to initialize ngx-translate configurations on bootstrap
  }
}
