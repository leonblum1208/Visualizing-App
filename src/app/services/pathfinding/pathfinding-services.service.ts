import { Injectable, ViewChild } from '@angular/core';
import { GridNode } from '../../datastructures/pathfinding-grid-node';
import { AllPurposeGraph, AllPurposeNode, AllPurposeEdge }from '../../datastructures/pathfinding-all-purpose-graph';
import { PathfindingAlgorithmsService } from './pathfinding-algorithms.service';
import { GRID_NODES, NUM_COLS_PATHFINDING, COL_TO_ROW_RATIO, DEFAULT_SPEED, DEFAULT_ALGORITHM,
  START_POS_RATIO, END_POS_RATIO, ALLOW_ANIMATION, ALLOW_DIAGONAL, DEFAULT_HEURISTIC, DEFAULT_HEURISTIC_WEIGHT
 } from '../../data/pathfinding-config'



export interface Algorithm {
  id: string;
  viewValue: string;
  url:string
}

export interface Heuristic {
  id: string;
  viewValue: string;
}

@Injectable({
  providedIn: 'root'
})
export class PathfindingServicesService {

  public heuristics: Heuristic[] = [
    {id: 'manhatten-distance', viewValue: "Manhatten Distance"},
    {id: 'diagonalManhatten', viewValue: 'Diagonal and Manhatten'},
    {id: 'beeline', viewValue: 'Euclidean Distance'},

  ]

  public selectedHeuristic:Heuristic = this.heuristics[DEFAULT_HEURISTIC];
  public heuristicWeight:number = DEFAULT_HEURISTIC_WEIGHT;

  public algorithms: Algorithm[] = [
    {id: 'dijkstra', viewValue: "Dijkstra's", url: "https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" },
    {id: 'a*', viewValue: 'A*', url: "https://en.wikipedia.org/wiki/A*_search_algorithm"  },
    {id: 'bfs', viewValue: 'BFS', url: "https://en.wikipedia.org/wiki/Breadth-first_search"},
    {id: 'dfs', viewValue: 'DFS', url: "https://en.wikipedia.org/wiki/Depth-first_search"},
  ];
  public selectedAlgorithm:Algorithm = this.algorithms[DEFAULT_ALGORITHM]

  public results!:any

  // Toolbar Settings
  public numOfCols:number = NUM_COLS_PATHFINDING;
  public numOfRows:number = Math.ceil(this.numOfCols * COL_TO_ROW_RATIO);
  public speedValue:number = DEFAULT_SPEED;
  public allowDiagonal:boolean = ALLOW_DIAGONAL;
  public allowAnimation:boolean = ALLOW_ANIMATION;
  
  // Animation Properties
  public currentlyAnmiating:boolean = false;
  public animationVisible:boolean = false;
  public forceStop: boolean = false;

  // Grid Interaction properties
  public currentlyDragging:boolean = false; 
  public dragStartNode:GridNode = new GridNode(-1, -1);
  public lastnodetype:string = "unvisited";

  // Sidebar properties
  public pathFindingSideNavOpened:boolean = false;

  // Statistics
  public visitedNodes:number = 0;
  public numberofNodes:number = 0;
  public percentageofNodesVisited = 0;
  public lengthofShortestPath:number = Number.POSITIVE_INFINITY;
  public lengthofCalculatedPath:number = Number.POSITIVE_INFINITY;

  // Info Stuff
  public algoInfoShown:boolean = false;
  public heuristicInfoShown:boolean = false;
  public heuristicWeightingInfo:boolean = false;
  public quickStartInfo:boolean = false;
  




  
  constructor(private _pathfindingAlgorithms : PathfindingAlgorithmsService) { }

  ngOnInit(): void {
    this.setStartEnd()
  }

  setStartEnd(): void{
    this.setNodeAs(GRID_NODES[Math.floor((this.numOfRows - 1) / 2)][Math.floor(this.numOfCols * START_POS_RATIO)], "isStart")
    this.setNodeAs(GRID_NODES[Math.floor((this.numOfRows - 1) / 2)][Math.floor(this.numOfCols * END_POS_RATIO) - 1], "isEnd")
  }

  resizeGrid():void{
    this.numOfRows = Math.ceil(this.numOfCols * COL_TO_ROW_RATIO)
    this.createNodes()
  }

  resetNodes(): void {
    this.animationVisible = false
    for(let row = 0; row < this.numOfRows; row++){
      for(let col = 0; col < this.numOfCols; col++){
        GRID_NODES[row][col].type = "unvisited";
      }
    }
    this.setStartEnd()
  }

  resetVisitedNodes(): void {
    this.animationVisible = false


    for(let row = 0; row < this.numOfRows; row++){
      for(let col = 0; col < this.numOfCols; col++){
        if (GRID_NODES[row][col].type === "visited" || GRID_NODES[row][col].type === "inPath" || GRID_NODES[row][col].type === "inShowShortestPath"){
          GRID_NODES[row][col].type = "unvisited"}
      }
    }
  }

  createNodes(): void  {
    this.animationVisible = false
    GRID_NODES.splice(0, GRID_NODES.length)
    for(let row = 0; row < this.numOfRows; row++){
      GRID_NODES.push([])
      for(let col = 0; col < this.numOfCols; col++){
        GRID_NODES[row].push(new GridNode(row, col));
      }
    }
    this.setStartEnd()
  }

  setNodeAs(node:GridNode, newtype:string):void {node.type = newtype}

  stopVisualization(){
    this.forceStop = true
  }

  updateVisited(){
    if(!this.animationVisible){return}
    let oldallowAnimation:boolean = this.allowAnimation
    this.allowAnimation = false

    this.visualizeAlgorithm()

    this.allowAnimation = oldallowAnimation
  }

  visualizeAlgorithm() {
    this.currentlyAnmiating = true

    let argsAlgorithmExecuter = {
      "data" : GRID_NODES,
      "dataType" : "tableMatrix",
      "algorithmId" : this.selectedAlgorithm.id,
      "includeDiagonals" : this.allowDiagonal,
      "heuristicId" : this.selectedHeuristic.id,
      "heuristicWeight" : this.heuristicWeight,
    }

    this.resetVisitedNodes()

    this.results = this._pathfindingAlgorithms.algorithmExecuter(argsAlgorithmExecuter)

    this.visitedNodes = this.results.visitedList.length
    this.numberofNodes = Object.keys(this.results.graph.Nodes).length
    this.percentageofNodesVisited = Math.round(this.visitedNodes/this.numberofNodes * 1000)/ 10
    this.lengthofShortestPath = Math.round(this.results.graphDijkstra.endNode.distanceToStartNode *10)/10
    this.lengthofCalculatedPath = Math.round(this.results.graph.endNode.distanceToStartNode *10)/10
   
    this.visualizeNodes(this.results.visitedList, this.results.pathList)
  
  }

  async visualizeNodes(visitedList:AllPurposeNode[], pathList:AllPurposeNode[]){

    for (let Node of visitedList){    
        if (this.forceStop) {break}
        if (GRID_NODES[Node.y][Node.x].type === "unvisited"){
        GRID_NODES[Node.y][Node.x].type = "visited"}
        if (this.allowAnimation) {await this.sleep(Math.floor(340/(Math.pow(this.speedValue, 2))))}
    } 

    for (let Node of pathList){ 
      if (this.forceStop) {break}
      if (GRID_NODES[Node.y][Node.x].type !== "isStart" && GRID_NODES[Node.y][Node.x].type !== "isEnd"){
        GRID_NODES[Node.y][Node.x].type = "inPath"
      if (this.allowAnimation){await this.sleep(Math.floor(700/(Math.pow(this.speedValue, 2))))}
      }    
    } 
    
    this.currentlyAnmiating = false
    this.animationVisible = true
    if (this.forceStop === true){
      this.forceStop = false;}
  }

  async showaShortestPath(){
    let pathList:AllPurposeNode[] = this.results.pathListDijkstra

    this.currentlyAnmiating = true

    for (let Node of pathList){ 
      if (this.forceStop) {break}
      if (GRID_NODES[Node.y][Node.x].type !== "isStart" && GRID_NODES[Node.y][Node.x].type !== "isEnd"){
        GRID_NODES[Node.y][Node.x].type = "inShowShortestPath"
      if (this.allowAnimation){await this.sleep(Math.floor(700/(Math.pow(this.speedValue, 2))))}
      }    
    } 
    
    this.currentlyAnmiating = false

    if (this.forceStop === true){this.resetVisitedNodes(); this.forceStop = false;}
  }



  
  sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
