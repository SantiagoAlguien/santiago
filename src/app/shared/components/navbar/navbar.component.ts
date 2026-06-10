import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { TranslationService } from '../../../core/i18n/translation.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'navbar-host',
  },
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly authService = inject(AuthService);
  private readonly translation = inject(TranslationService);
  private readonly theme = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isAuthenticated = this.authService.isAuthenticated;
  readonly currentUsername = this.authService.currentUsername;
  readonly currentLanguage = this.translation.currentLanguage;
  readonly currentTheme = this.theme.currentTheme;

  toggleLanguage(): void {
    this.translation.toggleLanguage();
  }

  toggleTheme(): void {
    this.theme.toggleTheme();
  }

  themeLabel(): string {
    return this.theme.currentTheme() === 'dark'
      ? this.translation.t('nav.lightMode')
      : this.translation.t('nav.darkMode');
  }

  languageLabel(): string {
    return this.translation.t('nav.language');
  }

  login(): void {
    this.router.navigate(['/login']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
