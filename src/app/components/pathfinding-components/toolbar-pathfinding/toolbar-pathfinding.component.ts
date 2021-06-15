import { Component, OnInit } from '@angular/core';
import { PathfindingServicesService } from '../../../services/pathfinding/pathfinding-services.service';



@Component({
  selector: 'app-toolbar-pathfinding',
  templateUrl: './toolbar-pathfinding.component.html',
  styleUrls: ['./toolbar-pathfinding.component.css']
})
export class ToolbarPathfindingComponent implements OnInit {

  constructor(public pathservice : PathfindingServicesService) {}
  ngOnInit(): void {}
 
}
