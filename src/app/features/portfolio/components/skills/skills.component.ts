import { Component, OnInit } from '@angular/core';
import { ChipModule } from 'primeng/chip';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [ChipModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
