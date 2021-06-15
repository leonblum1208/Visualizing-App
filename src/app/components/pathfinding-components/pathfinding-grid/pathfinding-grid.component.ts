import { Component, OnInit } from '@angular/core';
import { GridNode } from '../../../datastructures/pathfinding-grid-node';
import { GRID_NODES } from '../../../data/pathfinding-config'
import { PathfindingServicesService } from '../../../services/pathfinding/pathfinding-services.service';


@Component({
  selector: 'app-pathfinding-grid',
  templateUrl: './pathfinding-grid.component.html',
  styleUrls: ['./pathfinding-grid.component.css']
})
export class PathfindingGridComponent implements OnInit {

  public nodes:GridNode[][] = GRID_NODES

  // Mousevent properties
  public currentlyDragging:boolean = false; 
  public dragStartNode:GridNode = new GridNode(-1, -1);
  public lastnodetype:string = "unvisited";

  constructor(public pathservice : PathfindingServicesService) { }

  ngOnInit(): void {
    this.pathservice.createNodes()  
  }

  onMouseDown(buttonid:number, node:GridNode): void {
    if(this.pathservice.currentlyAnmiating){return}

    if (!this.currentlyDragging && buttonid ===1  && (node.type != "isStart" && node.type != "isEnd")) {
      node.type = node.type === "isWall" ? "unvisited" : "isWall";
      this.pathservice.updateVisited() 
    } 
    else if (buttonid ===1) {
      this.currentlyDragging = true
      this.dragStartNode = node
      this.lastnodetype = "unvisited"
      this.pathservice.updateVisited() 
    } 
  } 

  onMouseEnter(buttonid:number, node:GridNode): void {
    if(this.pathservice.currentlyAnmiating){return}

    if (!this.currentlyDragging &&buttonid === 1  && (node.type != "isStart" && node.type != "isEnd")) {
      node.type = node.type === "isWall" ? "unvisited" : "isWall"; 
      this.pathservice.updateVisited()    
    } 
    else if (buttonid === 1 && this.currentlyDragging){
      if (node.type !== "isStart" && node.type !== "isEnd"){
        let curnodetype:string = node.type
        this.setNodeAs(node, this.dragStartNode.type)
        this.setNodeAs(this.dragStartNode, this.lastnodetype) 
        this.lastnodetype = curnodetype  
        this.dragStartNode = node
        this.pathservice.updateVisited()

      }
      else{
        let currentlyoverthisnodetype:string = node.type
        this.setNodeAs(node, this.dragStartNode.type) 
        this.setNodeAs(this.dragStartNode, currentlyoverthisnodetype)
        this.dragStartNode = node
        this.pathservice.updateVisited() 
      }
      
    }
  }

  onMouseUp(node:GridNode): void {
    if(this.pathservice.currentlyAnmiating){return}
    
    if (this.currentlyDragging) {
      if(this.dragStartNode !== node){
        this.setNodeAs(node, this.dragStartNode.type)
        this.setNodeAs(this.dragStartNode, "unvisited")
        this.pathservice.updateVisited() 
      }    
      this.currentlyDragging = false  
    }
  }

  setNodeAs(node:GridNode, newtype:string){node.type = newtype}
  
}


