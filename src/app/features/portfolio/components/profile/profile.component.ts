import { Component, OnInit } from '@angular/core';
import { Avatar } from "primeng/avatar";


@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [Avatar]
})
export class ProfileComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
