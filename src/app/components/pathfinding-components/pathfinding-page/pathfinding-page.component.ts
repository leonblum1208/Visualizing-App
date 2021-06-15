import { Component, OnInit } from '@angular/core';
import { PathfindingServicesService } from '../../../services/pathfinding/pathfinding-services.service';

@Component({
  selector: 'app-pathfinding-page',
  templateUrl: './pathfinding-page.component.html',
  styleUrls: ['./pathfinding-page.component.css']
})
export class PathfindingPageComponent implements OnInit {

  constructor(public pathservice : PathfindingServicesService) { }

  ngOnInit(): void {
  }

}
