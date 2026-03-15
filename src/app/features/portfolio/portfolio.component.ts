import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ProfileComponent } from './components/profile/profile.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { EducationComponent } from './components/education/education.component';
import { ContactComponent } from './components/contact/contact.component';
import { VisitService } from '../../services/visit';



@Component({
  selector: 'app-portfolio',
  standalone: true,
  imports: [AvatarModule, ButtonModule, ProfileComponent, ExperienceComponent, SkillsComponent, EducationComponent, ContactComponent],
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.scss']
})
export class PortfolioComponent implements OnInit{

  visits:number = 0;

    constructor(
    private visitService: VisitService,
    private cdr: ChangeDetectorRef
  ){}

  ngOnInit(){

    // 1️⃣ siempre consulta el total al cargar
    this.visitService.getVisitCount().subscribe(count=>{
    this.visits = count;
    console.log("visitas:", count);
    this.cdr.detectChanges();
    this.visitService.checkVisit().subscribe(alreadyVisited=>{
      if(!alreadyVisited){
        this.visitService.registerVisit().subscribe(count=>{
          this.visits = count;
        });
      }
    });

  });


    // 2️⃣ verifica si ya visitó
    this.visitService.checkVisit().subscribe(alreadyVisited=>{

      if(!alreadyVisited){

        this.visitService.registerVisit().subscribe(count=>{
          this.visits = count;
        });

      }

    });

  }

}