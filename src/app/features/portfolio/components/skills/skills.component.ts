import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-skills',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ChipModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {}
