import { Component, OnInit } from '@angular/core';
import { PathfindingAlgorithmsService } from 'src/app/services/pathfinding/pathfinding-algorithms.service';


interface portfolioItems{
  viewValue:string
  routerLink:string
  imgPath:string
}

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {

  public portfolioItems:portfolioItems[] = [
    {viewValue: "Pathfinding", routerLink: "/pathfinding", imgPath:"assets/data/images/pathfinding_drone_snow_serpentine.jpg"},
    {viewValue: "Sorting", routerLink: "/sorting", imgPath:"assets/data/images/sorting_berries.jpg"},
    {viewValue: "Machine Learning", routerLink: "/car-ai", imgPath:"assets/data/images/AI_Synapse.jpg"},
    {viewValue: "Coming Soon", routerLink: "/home", imgPath:"assets/data/images/railway_nature.jpg"},
  ]
  

  constructor() { }

  ngOnInit(): void {
  }

}
