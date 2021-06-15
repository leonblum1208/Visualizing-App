import { Injectable } from '@angular/core';
import { CircleBarrier,LineBarrier } from './car-game-agent-service.service';

export interface stringobject {
  [index: string]: boolean;
}

export interface point {
  x:number,
  y:number,
  z?:number,
}

export interface vector {
  x:number,
  y:number,
  z?:number,
}

export interface edge {
  p1:point,
  p2:point,
}

export interface circlePart{
  origin:point,
  radius:number,
  startAngle:number,
  stopAngle:number,
}

export interface trackConstructionPlanObject{
  id:string
  p:point
}

export interface IntersectionInfo{
  intersecting:boolean
  colliding:boolean
  p:point|null
  t1:number
  t2?:number
  distofPoint?:number
}

export interface carStats{
  enginePower:number 
  engineEfficiency:number 
  engineTorque:number 
  enginetoTyreRatio:number 
  drivetrainEfficiency:number 
  tyreRadius:number 
  tyreFrictionCoefficient:number 
  rollingResistanceCoefficient:number 
  skewStiffnessCoefficientV:number 
  skewStiffnessCoefficientH:number 
  dragCoefficient: number
  liftCoefficient: number
  l_v_dividedBy_l_h:number
  centerofGravityHeigth:number
  frontSurface: number 
  length:number 
  width:number 
  weight:number 
  MaxsteeringAngle:number
  uncomfAcceleration:number
}

export interface carTrackInfo{
  p:point
  lastCheckpointEdgeID:number
  relativePositionOnTrack:number
  movedBackwards:boolean
  lapsCompleted:number
  lapTimes:number[]
  fastestLapTime:number
}

export interface track{
  id:string,
  viewValue:string,
  constructionPlan:trackConstructionPlanObject[]
  startPosition:point
}

export interface cell {
  left:number
  right:number
  top:number
  bot:number
  circleBarriers:CircleBarrier[]
  lineBarriers:LineBarrier[]
}

export class Grid {
  public cells:cell[][] = []
  public cellDim:number
  private collisionService:CollisionDetectionService
  public ctx:CanvasRenderingContext2D
  constructor(gameWidth:number, gameHeigth:number, circleBarriers:CircleBarrier[], 
    lineBarriers:LineBarrier[], collisionService:CollisionDetectionService , 
    ctx:CanvasRenderingContext2D, cellDim:number = 10){
    this.ctx = ctx
    this.cellDim = cellDim
    this.collisionService = collisionService

    let cellsPerCol = Math.ceil(gameWidth / cellDim)
    let cellsPerRow = Math.ceil(gameHeigth / cellDim)
    for (let row:number = 0; row < cellsPerRow+1; row++){
      this.cells.push([])
      for (let col:number = 0; col < cellsPerCol+1; col++){
        this.cells[row].push({
          left:col*this.cellDim,
          right:(col+1)*this.cellDim,
          top:row*this.cellDim,
          bot:(row+1)*this.cellDim,
          circleBarriers:[],
          lineBarriers:[]
        })
      }
    } 
    circleBarriers.forEach((circBar:CircleBarrier)=>{this.markCellsTouchedbyCirclePart(circBar)}) 
    lineBarriers.forEach((lineBar:LineBarrier)=>{this.markCellsTouchedbyEdge(lineBar)})    
  }

  checkCollisionsofEdge(e:edge):IntersectionInfo{
    let barriersChecked:stringobject = {}
    let intersecInfo:IntersectionInfo = {intersecting:false, colliding:false, p:null, t1:Number.POSITIVE_INFINITY}
    let tempInInfo:IntersectionInfo

    let colstart = Math.max(0,Math.min(Math.floor(e.p1.x / this.cellDim), this.cells[0].length-1))
    let rowstart = Math.max(0,Math.min(Math.floor(e.p1.y / this.cellDim), this.cells.length-1))
    let colend = Math.max(0,Math.min(Math.floor(e.p2.x / this.cellDim), this.cells[0].length-1))
    let rowend = Math.max(0,Math.min(Math.floor(e.p2.y / this.cellDim), this.cells.length-1))
    let colCount:number = Math.sign(colend - colstart)
    let rowCount:number = Math.sign(rowend - rowstart)
    colend += colCount
    rowend += rowCount

    
  
    if (colstart == colend) {
      if (rowstart == rowend){
        tempInInfo = this.checkCollisionsinCell(this.cells[rowstart][colstart], e, barriersChecked);
        if(tempInInfo.colliding){return tempInInfo};
      }
      else{
        while (rowstart != rowend ){
          tempInInfo = this.checkCollisionsinCell(this.cells[rowstart][colstart], e, barriersChecked);
          if(tempInInfo.colliding){return tempInInfo};
           rowstart += rowCount}
        
      } 
    } 
    else if (rowstart == rowend){ 
      while (colstart != colend ){
        tempInInfo = this.checkCollisionsinCell(this.cells[rowstart][colstart], e, barriersChecked); 
        if(tempInInfo.colliding){return tempInInfo};
        colstart += colCount}
    } 
    else {
      let deltax:number = e.p2.x-e.p1.x
      let deltay:number = e.p2.y-e.p1.y
      let dxbiggerdy = Math.abs(deltax) > Math.abs(deltay)
      let direcVec:vector = {x: dxbiggerdy ? Math.sign(deltax) : deltax/ Math.abs(deltay), y: dxbiggerdy ? deltay/ Math.abs(deltax) : Math.sign(deltay)}
      let colx:number = e.p1.x/this.cellDim
      let rowy:number = e.p1.y/this.cellDim
      let rowChanged:boolean = false
      let colChanged:boolean = false

      while (rowstart != rowend && colstart != colend){    
        if(rowChanged && colChanged){   
          tempInInfo = this.checkCollisionsinCell(this.cells[rowstart][colstart-colCount], e, barriersChecked)
          if(tempInInfo.colliding){return tempInInfo}   
          tempInInfo = this.checkCollisionsinCell(this.cells[rowstart-rowCount][colstart], e, barriersChecked)
          if(tempInInfo.colliding){return tempInInfo}                  
        }
        tempInInfo = this.checkCollisionsinCell(this.cells[rowstart][colstart], e, barriersChecked)
        if(tempInInfo.colliding){return tempInInfo}  
        
        colx += direcVec.x
        rowy += direcVec.y
        rowChanged = rowstart != Math.floor(rowy)
        colChanged = colstart != Math.floor(colx)
        if(rowChanged){rowstart += rowCount}
        if(colChanged){colstart += colCount}     
      }
    }   
    if(rowstart != rowend){
      tempInInfo = this.checkCollisionsinCell(this.cells[rowstart][colstart-colCount], e, barriersChecked)
      if(tempInInfo.colliding){return tempInInfo}  
    }
    else if(colstart != colend){
      tempInInfo = this.checkCollisionsinCell(this.cells[rowstart-rowCount][colstart], e, barriersChecked)
      if(tempInInfo.colliding){return tempInInfo} 
    }
    return intersecInfo
  }

  checkCollisionsinCell(cell:cell, e:edge, barriersChecked:stringobject, drawGrid:boolean = false):IntersectionInfo{
    if(drawGrid)this.drawCell(cell.top/this.cellDim, cell.left/this.cellDim);
    let i:number
    let intersecInfo:IntersectionInfo = {intersecting:false, colliding:false, p:null, t1:Number.POSITIVE_INFINITY}
    let tempInInfo:IntersectionInfo

    for(i = 0; i < cell.lineBarriers.length; i++){
      if(barriersChecked.hasOwnProperty(cell.lineBarriers[i].id)){continue}
      barriersChecked[cell.lineBarriers[i].id] = true
      tempInInfo = this.collisionService.lineIntersect(e, cell.lineBarriers[i].edge)
      intersecInfo = tempInInfo.colliding && tempInInfo.t1 < intersecInfo.t1 ? tempInInfo : intersecInfo
    }
    for(i = 0; i < cell.circleBarriers.length; i++){
      if(barriersChecked.hasOwnProperty(cell.circleBarriers[i].id)){continue}
      barriersChecked[cell.circleBarriers[i].id] = true
      tempInInfo = this.collisionService.linecircleIntersect(cell.circleBarriers[i].circlePart, e)
      intersecInfo = tempInInfo.colliding && tempInInfo.t1 < intersecInfo.t1 ? tempInInfo : intersecInfo
    }
    return intersecInfo
  }

  markCellsTouchedbyEdge(lineBarrier:LineBarrier, drawGrid:boolean = false){
    let e:edge = lineBarrier.edge
    let colstart = Math.max(0,Math.min(Math.floor(e.p1.x / this.cellDim), this.cells[0].length-1))
    let rowstart = Math.max(0,Math.min(Math.floor(e.p1.y / this.cellDim), this.cells.length-1))
    let colend = Math.max(0,Math.min(Math.floor(e.p2.x / this.cellDim), this.cells[0].length-1))
    let rowend = Math.max(0,Math.min(Math.floor(e.p2.y / this.cellDim), this.cells.length-1))
    let colCount:number = Math.sign(colend - colstart)
    let rowCount:number = Math.sign(rowend - rowstart)
    colend += colCount
    rowend += rowCount


  
    if (colstart == colend) {
      if (rowstart == rowend){
        this.cells[rowstart][colstart].lineBarriers.push(lineBarrier); 
        if(drawGrid)this.drawCell(rowstart,colstart); 
      }
      else{
        while (rowstart != rowend ){
          this.cells[rowstart][colstart].lineBarriers.push(lineBarrier); 
          if(drawGrid)this.drawCell(rowstart,colstart); 
          rowstart += rowCount
        }
      } 
    } 
    else if (rowstart == rowend){ 
      while (colstart != colend ){
        this.cells[rowstart][colstart].lineBarriers.push(lineBarrier); 
        if(drawGrid)this.drawCell(rowstart,colstart);
        colstart += colCount       
      }
    } 
    else {
      let deltax:number = e.p2.x-e.p1.x
      let deltay:number = e.p2.y-e.p1.y
      let dxbiggerdy = Math.abs(deltax) > Math.abs(deltay)
      let direcVec:vector = {x: dxbiggerdy ? Math.sign(deltax) : deltax/ Math.abs(deltay), y: dxbiggerdy ? deltay/ Math.abs(deltax) : Math.sign(deltay)}
      let colx:number = e.p1.x/this.cellDim
      let rowy:number = e.p1.y/this.cellDim
      let rowChanged:boolean = false
      let colChanged:boolean = false
      while (rowstart != rowend && colstart != colend){    
        this.cells[rowstart][colstart].lineBarriers.push(lineBarrier); if(drawGrid)this.drawCell(rowstart,colstart);
        if(rowChanged && colChanged){   
          this.cells[rowstart-rowCount][colstart].lineBarriers.push(lineBarrier); if(drawGrid)this.drawCell(rowstart-rowCount,colstart);
          this.cells[rowstart][colstart-colCount].lineBarriers.push(lineBarrier); if(drawGrid)this.drawCell(rowstart,colstart-colCount);              
        }
        colx += direcVec.x
        rowy += direcVec.y
        rowChanged = rowstart != Math.floor(rowy)
        colChanged = colstart != Math.floor(colx)
        if(rowChanged){rowstart += rowCount}
        if(colChanged){colstart += colCount}          
      }
      if(rowstart != rowend){this.cells[rowstart][colstart-colCount].lineBarriers.push(lineBarrier)}
      else if(colstart != colend){this.cells[rowstart-rowCount][colstart].lineBarriers.push(lineBarrier)}
    }   
  }

  markCellsTouchedbyCirclePart(CircleBarrier:CircleBarrier, drawGrid:boolean = false){ //very inefficient only use during initialization
    let circlepart: circlePart = CircleBarrier.circlePart
    let colstart = Math.floor((circlepart.origin.x - circlepart.radius) / this.cellDim) 
    let rowstart = Math.floor((circlepart.origin.y - circlepart.radius) / this.cellDim)
    let colend = Math.min(Math.floor((circlepart.origin.x + circlepart.radius) / this.cellDim), this.cells[0].length-1)
    let rowend = Math.min(Math.floor((circlepart.origin.y + circlepart.radius) / this.cellDim), this.cells.length-1)
    let addedBarriertoAtleastOneCell:boolean = false
    for (let row:number = rowstart; row <= rowend; row++){
      for (let col:number = colstart; col <= colend; col++){
        let y0:number = row*this.cellDim;let y1:number = (row+1)*this.cellDim;
        let x0:number = col*this.cellDim;let x1:number = (col+1)*this.cellDim;
        if (  this.collisionService.linecircleIntersect(circlepart, {p1:{x:x0,y:y0},p2:{x:x1,y:y0}}).colliding ||
              this.collisionService.linecircleIntersect(circlepart, {p1:{x:x1,y:y0},p2:{x:x1,y:y1}}).colliding ||
              this.collisionService.linecircleIntersect(circlepart, {p1:{x:x1,y:y1},p2:{x:x0,y:y1}}).colliding ||
              this.collisionService.linecircleIntersect(circlepart, {p1:{x:x0,y:y1},p2:{x:x0,y:y0}}).colliding
        ){
          this.cells[row][col].circleBarriers.push(CircleBarrier)
          if(drawGrid)this.drawCell(row,col);
          addedBarriertoAtleastOneCell = true
        }
      }
    }
    if(!addedBarriertoAtleastOneCell){
      let x = Math.cos(circlepart.startAngle) * circlepart.radius
      let y = Math.sin(circlepart.startAngle) * circlepart.radius
      let col = Math.max(0,Math.min(Math.floor(x / this.cellDim), this.cells[0].length-1))
      let row = Math.max(0,Math.min(Math.floor(y / this.cellDim), this.cells.length-1))
      this.cells[row][col].circleBarriers.push(CircleBarrier)
          if(drawGrid)this.drawCell(row,col);
    }
  }

  drawCell(row:number, col:number){
    this.ctx.fillStyle = "red" 
    this.ctx.fillRect(col*this.cellDim, row*this.cellDim, this.cellDim, this.cellDim)
  }
}


@Injectable({
  providedIn: 'root'
})
export class CollisionDetectionService {

  constructor() { }

  linecircleIntersect(circlePart:circlePart, edge:edge):IntersectionInfo{
    let returnInfo:IntersectionInfo = {intersecting:false, colliding:false, p:null, t1:Number.POSITIVE_INFINITY}

    let r:number = circlePart.radius
    let x0:number = circlePart.origin.x
    let y0:number = circlePart.origin.y
    let phistart:number = circlePart.startAngle % (2*Math.PI)
    let phiend:number = circlePart.stopAngle % (2*Math.PI)

    let deltax:number = edge.p2.x - edge.p1.x
    let deltay:number = edge.p2.y - edge.p1.y
    let XorYAxisIntersectionPoint:point|null, a:number, b:number, c:number, d:number // ax + by = c
    if (deltax == 0){a=1;b=0;c=edge.p1.x}
    else if (deltay == 0){a=0;b=1;c=edge.p1.y}
    else {
      let yAxisEdge:edge = {p1:{x:0,y:0},p2:{x:0,y:1}};
      XorYAxisIntersectionPoint = this.lineIntersect(edge, yAxisEdge).p;
      if (XorYAxisIntersectionPoint != null){c=XorYAxisIntersectionPoint.y}
      else {throw Error("linecircleIntersect: got invalid point. Should not hit this.")}
      a=-(deltay/deltax); b=1; ;
    }
    d = c - a*x0 - b*y0

    let a2_plus_b2:number = (Math.pow(a,2) + Math.pow(b,2))
    let underrootstuff = Math.pow(r,2)*a2_plus_b2 - Math.pow(d,2)
    if (underrootstuff < 0){return returnInfo}  
    let rootofstuff:number = Math.sqrt(underrootstuff)

    let intersectionpoint1_x:number = x0 + (a*d+b*rootofstuff)/(a2_plus_b2)
    let intersectionpoint1_y:number = y0 + (b*d-a*rootofstuff)/(a2_plus_b2)
    let intersectionpoint2_x:number = x0 + (a*d-b*rootofstuff)/(a2_plus_b2)
    let intersectionpoint2_y:number = y0 + (b*d+a*rootofstuff)/(a2_plus_b2)

    let angle1:number = Math.acos((intersectionpoint1_x-x0)/(r))
    angle1 = intersectionpoint1_y < y0 ? 2*Math.PI - angle1 : angle1
    
    let angle2:number = Math.acos((intersectionpoint2_x-x0)/(r))
    angle2 = intersectionpoint2_y < y0 ? 2*Math.PI - angle2 : angle2

    if(!(this.angleInRange(phistart,phiend,angle2)) ){ 
      if (!(this.angleInRange(phistart,phiend,angle1)) ){return returnInfo}
      let vec_edgep1_isecpoint1:vector = {x:edge.p1.x - intersectionpoint1_x, y:edge.p1.y - intersectionpoint1_y}
      let vec_edgep2_isecpoint1:vector = {x:edge.p2.x - intersectionpoint1_x, y:edge.p2.y - intersectionpoint1_y}
      if (Math.sign(vec_edgep1_isecpoint1.x) != Math.sign(vec_edgep2_isecpoint1.x)|| Math.sign(vec_edgep1_isecpoint1.y) != Math.sign(vec_edgep2_isecpoint1.y)){
        returnInfo.colliding = true; 
      }
      returnInfo.p = {x: intersectionpoint1_x, y: intersectionpoint1_y}; returnInfo.intersecting = true
      returnInfo.t1 = deltax != 0 ? (intersectionpoint1_x-edge.p1.x)/deltax : (intersectionpoint1_y-edge.p1.y)/deltay
          
    }else if (!(this.angleInRange(phistart,phiend,angle1)) ){
      let vec_edgep1_isecpoint2:vector = {x:edge.p1.x - intersectionpoint2_x, y:edge.p1.y - intersectionpoint2_y}
      let vec_edgep2_isecpoint2:vector = {x:edge.p2.x - intersectionpoint2_x, y:edge.p2.y - intersectionpoint2_y}
      if (Math.sign(vec_edgep1_isecpoint2.x) != Math.sign(vec_edgep2_isecpoint2.x)|| Math.sign(vec_edgep1_isecpoint2.y) != Math.sign(vec_edgep2_isecpoint2.y)){
        returnInfo.colliding = true; 
      }
      returnInfo.p = {x: intersectionpoint2_x, y: intersectionpoint2_y}; returnInfo.intersecting = true
      returnInfo.t1 = deltax != 0 ? (intersectionpoint2_x-edge.p1.x)/deltax : (intersectionpoint2_y-edge.p1.y)/deltay
      
      
    } else { // both points can be hit aka valid and on circle-slice 
      returnInfo.intersecting = true 
      let vec_edgep1_isecpoint1:vector = {x:edge.p1.x - intersectionpoint1_x, y:edge.p1.y - intersectionpoint1_y}
      let vec_edgep2_isecpoint1:vector = {x:edge.p2.x - intersectionpoint1_x, y:edge.p2.y - intersectionpoint1_y}
      let vec_edgep1_isecpoint2:vector = {x:edge.p1.x - intersectionpoint2_x, y:edge.p1.y - intersectionpoint2_y}
      let vec_edgep2_isecpoint2:vector = {x:edge.p2.x - intersectionpoint2_x, y:edge.p2.y - intersectionpoint2_y}
      let dist_edgep1_isecpoint1:number = Math.hypot(vec_edgep1_isecpoint1.x, vec_edgep1_isecpoint1.y)
      //let dist_edgep2_isecpoint1:number = Math.hypot(vec_edgep2_isecpoint1.x, vec_edgep2_isecpoint1.y)
      let dist_edgep1_isecpoint2:number = Math.hypot(vec_edgep1_isecpoint2.x, vec_edgep1_isecpoint2.y)
      //let dist_edgep2_isecpoint2:number = Math.hypot(vec_edgep2_isecpoint2.x, vec_edgep2_isecpoint2.y)
      
      if (Math.sign(vec_edgep1_isecpoint1.x) == Math.sign(vec_edgep2_isecpoint1.x) && Math.sign(vec_edgep1_isecpoint1.y) == Math.sign(vec_edgep2_isecpoint1.y) && 
      (Math.sign(vec_edgep1_isecpoint2.x) == Math.sign(vec_edgep2_isecpoint2.x) && Math.sign(vec_edgep1_isecpoint2.y) == Math.sign(vec_edgep2_isecpoint2.y)) ){
          if (dist_edgep1_isecpoint1 > dist_edgep1_isecpoint2){
            returnInfo.p = {x: intersectionpoint2_x, y: intersectionpoint2_y}
            returnInfo.t1 = deltax != 0 ? (intersectionpoint2_x-edge.p1.x)/deltax : (intersectionpoint2_y-edge.p1.y)/deltay
          } else {
            returnInfo.p = {x: intersectionpoint1_x, y: intersectionpoint1_y}
            returnInfo.t1 = deltax != 0 ? (intersectionpoint1_x-edge.p1.x)/deltax : (intersectionpoint1_y-edge.p1.y)/deltay
          }     
      }else if ((Math.sign(vec_edgep1_isecpoint1.x) != Math.sign(vec_edgep2_isecpoint1.x) || Math.sign(vec_edgep1_isecpoint1.y) != Math.sign(vec_edgep2_isecpoint1.y)) && 
      ((Math.sign(vec_edgep1_isecpoint2.x) != Math.sign(vec_edgep2_isecpoint2.x) || Math.sign(vec_edgep1_isecpoint2.y) != Math.sign(vec_edgep2_isecpoint2.y)))){
          returnInfo.colliding = true;
          if (dist_edgep1_isecpoint1 > dist_edgep1_isecpoint2){
            returnInfo.p = {x: intersectionpoint2_x, y: intersectionpoint2_y}
            returnInfo.t1 = deltax != 0 ? (intersectionpoint2_x-edge.p1.x)/deltax : (intersectionpoint2_y-edge.p1.y)/deltay
          } else {
            returnInfo.p = {x: intersectionpoint1_x, y: intersectionpoint1_y}
            returnInfo.t1 = deltax != 0 ? (intersectionpoint1_x-edge.p1.x)/deltax : (intersectionpoint1_y-edge.p1.y)/deltay
          }     
      }else if ((Math.sign(vec_edgep1_isecpoint1.x) != Math.sign(vec_edgep2_isecpoint1.x) || Math.sign(vec_edgep1_isecpoint1.y) != Math.sign(vec_edgep2_isecpoint1.y))){
        returnInfo.p = {x: intersectionpoint1_x, y: intersectionpoint1_y};
        returnInfo.t1 = deltax != 0 ? (intersectionpoint1_x-edge.p1.x)/deltax : (intersectionpoint1_y-edge.p1.y)/deltay
        returnInfo.colliding = true;
      } else {
        returnInfo.p = {x: intersectionpoint2_x, y: intersectionpoint2_y};
        returnInfo.t1 = deltax != 0 ? (intersectionpoint2_x-edge.p1.x)/deltax : (intersectionpoint2_y-edge.p1.y)/deltay
        returnInfo.colliding = true;
      }  
    }
    return returnInfo
  }

  angleInRange(startangle:number, endangle:number, angletocheck:number):boolean{
    if(startangle <= endangle){return startangle <= angletocheck && angletocheck <= endangle}
    else{return (startangle <= angletocheck && angletocheck <= Math.PI*2) || 
      (0 <= angletocheck && angletocheck <= endangle)}
  }

  lineIntersect(edge1:edge, edge2:edge):IntersectionInfo{
    let returnInfo:IntersectionInfo = {intersecting:false, colliding:false, p:null, t1:Number.POSITIVE_INFINITY}

    let p1x:number = edge1.p1.x
    let p1y:number = edge1.p1.y
    let p2x:number = edge2.p1.x
    let p2y:number = edge2.p1.y

    let s1x:number = edge1.p2.x - p1x
    let s1y:number = edge1.p2.y - p1y
    let s2x:number = edge2.p2.x - p2x
    let s2y:number = edge2.p2.y - p2y

    let tempDenom:number = (s1y*s2x) - (s1x*s2y)
    if (tempDenom == 0){
      if(edge1.p1.x == edge2.p1.x && edge1.p1.y == edge2.p1.y)
      {return {intersecting:true, colliding:true, p:edge1.p1, t1: Number.POSITIVE_INFINITY, t2:Number.POSITIVE_INFINITY} }
      else {return returnInfo}
    }
    
    let t1:number = ((p2x-p1x)*(-s2y) + (p2y-p1y)*(s2x))/tempDenom // Cramersche Rule det/det 
    let t2:number = ((s1x)*(p2y-p1y) - (s1y)*(p2x-p1x))/tempDenom

    
    let intersectionpoint:point = {x:p1x + t1*s1x, y:p1y + t1*s1y}
    if((0 <= t1 && t1 <=1 && 0 <= t2 && t2 <=1) ){     
      return {intersecting:true, colliding:true, p:intersectionpoint, t1:t1, t2:t2}
    }
    return {intersecting:true, colliding:false, p:intersectionpoint, t1:t1, t2:t2}
  }

  fastLineCollision(p0_x:number, p0_y:number, p1_x:number, p1_y:number, p2_x:number, p2_y:number, p3_x:number, p3_y:number):boolean{ 
    let s1_x:number = p1_x - p0_x;
    let s1_y:number = p1_y - p0_y;
    let s2_x:number = p3_x - p2_x;
    let s2_y:number = p3_y - p2_y;
    let s:number, t:number;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {return true}
    return false; 
  }

  constructCircle(p0:point, p1:point, p2:point):circlePart{
    if(p1.x == p2.x && p2.x == p2.y){throw Error("constructCircle not possible for two eqaul points")}
    if(p0.x == p1.x && p0.x == p1.y){throw Error("constructCircle not possible for two eqaul points")}
      
    let s01:vector = {x: p1.x-p0.x, y: p1.y-p0.y}
    let s12:vector = {x: p2.x-p1.x, y: p2.y-p1.y}

    let perpens01:vector = this.getPerpendicularVector(s01)
    let perpens12:vector = this.getPerpendicularVector(s12)
    let p12:point = {x: p1.x+s12.x*0.5, y: p1.y+s12.y*0.5}
    let e1:edge = {p1:p1, p2:{x: p1.x + perpens01.x, y: p1.y + perpens01.y}}
    let e2:edge = {p1:p12, p2:{x: p12.x + perpens12.x, y: p12.y + perpens12.y}}

    let possiblemidpoint:point|null = this.lineIntersect(e1, e2).p
    if(possiblemidpoint == null){throw Error("constructCircle not possible for two parallel edges")}
    let s1midpoint:vector = {x: p1.x-possiblemidpoint.x, y: p1.y-possiblemidpoint.y}
    let crossProduct = s01.x * s1midpoint.y - s01.y * s1midpoint.x

    let radius = Math.hypot(s1midpoint.x, s1midpoint.y)
      
    let angle1:number = Math.acos((p1.x-possiblemidpoint.x)/radius)
    angle1 = p1.y < possiblemidpoint.y ? 2*Math.PI - angle1 : angle1
       
    let angle2:number = Math.acos((p2.x-possiblemidpoint.x)/radius)
    angle2 = p2.y < possiblemidpoint.y ? 2*Math.PI - angle2 : angle2

    if(crossProduct > 0){return {origin:possiblemidpoint, radius:radius, startAngle:angle2, stopAngle:angle1}}
    else{return {origin:possiblemidpoint, radius:radius, startAngle:angle1, stopAngle:angle2}}
  }

  getPerpendicularVector(vector:vector):vector{
    if(vector.x == 0 && vector.y == 0){throw Error("getPerpendicularVector not possible for 0|0 vector")}
    let newvec:vector = {x:0,y:0}
    if(vector.x == 0){newvec.x = vector.y}
    else if(vector.y == 0){newvec.y = vector.x}
    else {newvec.x = -vector.y; newvec.y = vector.x}
    return newvec
  }

  pointinRectangle(p:point, cell:cell):boolean{
    return cell.left <= p.x && p.x <= cell.right && cell.top <= p.y && p.y <= cell.bot
  }

  edgeinRectangle(edge:edge, cell:cell):boolean{
    return this.pointinRectangle(edge.p1, cell) || this.pointinRectangle(edge.p2, cell) ||
    this.fastLineCollision(edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y, cell.left, cell.top, cell.left, cell.bot) ||
    this.fastLineCollision(edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y, cell.left, cell.top, cell.right, cell.top) ||
    this.fastLineCollision(edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y, cell.right, cell.top, cell.right, cell.bot) ||
    this.fastLineCollision(edge.p1.x, edge.p1.y, edge.p2.x, edge.p2.y, cell.right, cell.bot, cell.left, cell.bot) 
  }

  distPointtoEdge(p:point, e:edge):IntersectionInfo{
    let edgeVec:vector = {x: e.p2.x - e.p1.x, y: e.p2.y - e.p1.y}
    let perpNormVec:vector = this.normalizeVector(this.getPerpendicularVector(edgeVec))
    let insecInfo:IntersectionInfo = this.lineIntersect({p1:p,p2:{x:p.x+perpNormVec.x,y:p.y+perpNormVec.y}}, e)
    if(insecInfo.t2 != undefined && 0 <= insecInfo.t2 && insecInfo.t2 <= 1){
      insecInfo.colliding = true; 
      insecInfo.distofPoint = Math.abs(insecInfo.t1)
    }
    else{
      insecInfo.distofPoint =  Math.min(Math.hypot(p.x - e.p1.x, p.y - e.p1.y), Math.hypot(p.x - e.p2.x, p.y - e.p2.y))
    }
    return insecInfo
  }

  normalizeVector(v:vector):vector{
    let length:number = Math.hypot(v.x,v.y)
    if(length == 0){return v}
    return {x:v.x/length, y:v.y/length}
  }

  drawEdge(ctx:CanvasRenderingContext2D, edge:edge){
    ctx.beginPath();
    ctx.moveTo(edge.p1.x, edge.p1.y);
    ctx.lineTo(edge.p2.x, edge.p2.y);
    ctx.stroke();
  }

  drawRect(ctx:CanvasRenderingContext2D, p:point, width:number, heigth:number, angle:number){
    ctx.translate(p.x, p.y)
    ctx.rotate(angle)
    ctx.fillStyle = "purple" 
    ctx.fillRect(0, 0, heigth, width)
    ctx.rotate(-angle)
    ctx.translate(-p.x, -p.y)
  }

  drawCircle(ctx:CanvasRenderingContext2D, p:point, radius:number = 5, fill:boolean = false){
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI*2);
    ctx.stroke();
    if(fill){ctx.fill()}
  }

} 
