import { Component } from '@angular/core';
import { Avatar } from "primeng/avatar";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [Avatar],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent {}
