import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { form, FormField, required, submit } from '@angular/forms/signals';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { AuthService } from '../../../services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { firstValueFrom } from 'rxjs';

interface LoginFormModel {
  username: string;
  password: string;
}

@Component({
  selector: 'app-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, ButtonModule, InputTextModule, ToastModule, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  readonly submitting = signal(false);

  readonly loginModel = signal<LoginFormModel>({
    username: '',
    password: '',
  });

  readonly loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.username, { message: 'login.usernameRequired' });
    required(schemaPath.password, { message: 'login.passwordRequired' });
  });

  onSubmit(event: Event): void {
    event.preventDefault();

    submit(this.loginForm, async () => {
      this.submitting.set(true);
      try {
        await firstValueFrom(this.authService.login(this.loginModel()));
        this.messageService.add({
          severity: 'success',
          summary: this.i18n.t('toast.welcome'),
          detail: this.i18n.t('toast.loginOk'),
        });
        this.router.navigate(['/blogs']);
      } catch (err) {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.loginFail')),
        });
        throw err;
      } finally {
        this.submitting.set(false);
      }
    });
  }
}
