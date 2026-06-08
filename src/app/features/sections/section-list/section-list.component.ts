import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { Section } from '../../../core/models/section.model';
import { TranslationService } from '../../../core/i18n/translation.service';
import { getErrorMessage } from '../../../core/utils/http-error.util';
import { SectionService } from '../../../services/section.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-section-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TableModule, ButtonModule, ConfirmDialogModule, ToastModule, TranslatePipe],
  providers: [ConfirmationService],
  template: `
    <p-toast />
    <p-confirmDialog />

    <div class="section-admin">
      <div class="header">
        <h1>{{ 'section.manage' | translate }}</h1>
        <button
          pButton
          type="button"
          [label]="'section.create' | translate"
          icon="pi pi-plus"
          (click)="navigateToCreate()"
        ></button>
      </div>

      <div class="card">
        <p-table
          [value]="sections()"
          dataKey="id"
          [paginator]="true"
          [rows]="10"
          [rowsPerPageOptions]="[5, 10, 25]"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>{{ 'section.name' | translate }}</th>
              <th>{{ 'section.description' | translate }}</th>
              <th></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-section>
            <tr>
              <td>{{ section.id }}</td>
              <td>{{ section.name }}</td>
              <td>{{ stripHtml(section.description) }}</td>
              <td>
                <button
                  pButton
                  type="button"
                  icon="pi pi-pencil"
                  severity="info"
                  (click)="navigateToEdit(section.id)"
                ></button>
                <button
                  pButton
                  type="button"
                  icon="pi pi-trash"
                  severity="danger"
                  (click)="deleteSection(section.id)"
                ></button>
              </td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; }
    .section-admin { padding: 1rem 0; }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .card {
      background: var(--surface-color);
      box-shadow: var(--shadow-md);
      border-radius: var(--radius-lg);
      padding: 1rem;
    }
  `,
})
export class SectionListComponent implements OnInit {
  private readonly sectionService = inject(SectionService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly i18n = inject(TranslationService);

  readonly sections = signal<Section[]>([]);

  ngOnInit(): void {
    this.loadSections();
  }

  loadSections(): void {
    this.sectionService.getSections().subscribe({
      next: (data) => this.sections.set(data),
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.i18n.t('toast.error'),
          detail: getErrorMessage(err, this.i18n.t('toast.loadSectionsFail')),
        });
      },
    });
  }

  stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').slice(0, 80);
  }

  navigateToCreate(): void {
    this.router.navigate(['/admin/sections/create']);
  }

  navigateToEdit(id: number): void {
    this.router.navigate(['/admin/sections/edit', id]);
  }

  deleteSection(id: number): void {
    this.confirmationService.confirm({
      message: this.i18n.t('common.confirmDelete'),
      header: this.i18n.t('common.confirmHeader'),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.i18n.t('common.accept'),
      rejectLabel: this.i18n.t('common.reject'),
      accept: () => {
        this.sectionService.deleteSection(id).subscribe({
          next: () => {
            this.sections.update((list) => list.filter((s) => s.id !== id));
            this.messageService.add({
              severity: 'success',
              summary: this.i18n.t('toast.success'),
              detail: this.i18n.t('toast.sectionDeleted'),
            });
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: this.i18n.t('toast.error'),
              detail: getErrorMessage(err, this.i18n.t('toast.deleteSectionFail')),
            });
          },
        });
      },
    });
  }
}
