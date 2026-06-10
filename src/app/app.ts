import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslationService } from './core/i18n/translation.service';
import { ThemeService } from './core/services/theme.service';
import { NavbarComponent } from './shared/components/navbar/navbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly translation = inject(TranslationService);
  private readonly theme = inject(ThemeService);
  protected readonly title = signal('santiago');

  ngOnInit(): void {
    document.documentElement.lang = this.translation.currentLanguage();
    document.documentElement.setAttribute('data-theme', this.theme.currentTheme());
  }
}
