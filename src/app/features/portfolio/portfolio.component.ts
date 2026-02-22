import { Component } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProfileComponent } from './components/profile/profile.component';


@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [AvatarModule, ButtonModule, ProfileComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent {}