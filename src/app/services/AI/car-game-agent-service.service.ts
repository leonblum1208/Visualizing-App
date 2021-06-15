import { ElementRef, Injectable } from '@angular/core';
import { CollisionDetectionService, track, point, vector, edge, carStats, circlePart, carTrackInfo, trackConstructionPlanObject, Grid, IntersectionInfo,  } from './collision-detection.service';
import { FRAME, TRACKS, PIXEL_PER_METER, GAME_WIDTH, GAME_HEIGTH, GRID_CELL_DIM,
  POPULATION_SIZE, BREEDING_INFO, START_ANGLE, MAX_LAPS, SELECTED_TRACK_ID,
  TIME_CAP_PER_GENERATION, CAR_STATS,  SPEED_UP_FACTOR, DIST_SENSORS, AI_CAR_CONSTRUCTION_PLAN,
  FITNESS_FUNCTION_INFO,
} from '../../data/car-ai-tracks'
import { networkPlan, numberrange, fitnessFunctionInfo, FFneuralnetwork, NeuralNetworkService, breedingInfo, instance,  
  aICarConstructionPlan, SensorConstructionPlan, optionAsStringID} from './neural-network.service';
import { single } from 'rxjs/operators';



export class Checkpoints{
  public points:point[]
  public distances:number[]
  public summedDistances:number[]
  public edges:edge[]
  public tracklength:number
  public carGameAgentService:CarGameAgentServiceService
  constructor(points:point[], carGameAgentService:CarGameAgentServiceService){
    if (points.length < 2){throw Error("Checkpoints constructer: Less then 2 Points given: cant construct")}
    this.carGameAgentService = carGameAgentService
    this.points = points
    this.edges = []
    this.distances = []
    this.summedDistances = []
    this.tracklength = 0
    for(let i:number = 1; i < points.length; i++){
      this.edges.push({p1:this.points[i-1],p2:this.points[i]})

      let tempDist:number = Math.hypot(this.points[i].x - this.points[i-1].x, this.points[i].y - this.points[i-1].y)
      if (tempDist == 0){throw Error("Checkpoints constructer: distance between points is 0: cant construct")}
      this.distances.push(tempDist)
      this.tracklength += tempDist
      this.summedDistances.push(tempDist + (this.summedDistances.length > 0 ? this.summedDistances[this.summedDistances.length-1]: 0))
    }
    this.distances.forEach((_,i,arr) => {arr[i] /= this.tracklength})   
    this.summedDistances.forEach((_,i,arr) => {arr[i] /= this.tracklength})   
  }

  draw(ctx:CanvasRenderingContext2D){
    this.points.forEach((p:point)=>{
      ctx.beginPath();
      ctx.arc(p.x, p.y, 5, 0, Math.PI*2);
      ctx.stroke();
    })
  }

  safeCarTrackInfoUpdate(cTI:carTrackInfo,showClosestLine:boolean = false){
    let prevPos:number = cTI.relativePositionOnTrack
    let minDist:number = Number.POSITIVE_INFINITY
    let insecInfo:IntersectionInfo
    let closestInfo:IntersectionInfo = {intersecting:false, colliding:false, p:{x:0,y:0}, t1:Number.POSITIVE_INFINITY}
    let closestEdgeId:number = 0

    this.edges.forEach((e:edge, i:number) => {
      insecInfo = this.carGameAgentService.collisionservice.distPointtoEdge(cTI.p, e)
      if (insecInfo.distofPoint != undefined && !(insecInfo.distofPoint > minDist)){
        closestEdgeId = i; 
        minDist = insecInfo.distofPoint;
        closestInfo = insecInfo
      } 
    })

    if(closestInfo.t2 != undefined){
    cTI.relativePositionOnTrack = this.summedDistances[closestEdgeId] - this.distances[closestEdgeId] * 
    (0.9 - 0.9*Math.max(0,closestInfo.t2) - 0.1*(Math.max(-1,Math.min(0,closestInfo.t2))));
    } 
    cTI.lastCheckpointEdgeID = closestEdgeId 
    cTI.movedBackwards = cTI.relativePositionOnTrack < prevPos ? true : false;

    if(showClosestLine){this.carGameAgentService.drawEdge(this.edges[closestEdgeId], "black")}
  }

  fastCarTrackInfoUpdate(cTI:carTrackInfo){
    let prevPos:number = cTI.relativePositionOnTrack
    let numofEdges:number = this.edges.length

    let i2:number = cTI.lastCheckpointEdgeID
    let i0:number = i2 > 1 ? i2 - 2 : i2
    let i1:number = i2 > 0 ? i2 - 1 : i2
    let i3:number = (i2 + 1) % numofEdges
    let i4:number = (i2 + 2) % numofEdges     

    let colservice:CollisionDetectionService = this.carGameAgentService.collisionservice
    
    let info2:IntersectionInfo = colservice.distPointtoEdge(cTI.p, this.edges[i2])
    let info0:IntersectionInfo = i0 != i2 ? colservice.distPointtoEdge(cTI.p, this.edges[i0]) : info2
    let info1:IntersectionInfo = i1 != i2 ? colservice.distPointtoEdge(cTI.p, this.edges[i1]) : info2
    let info3:IntersectionInfo = colservice.distPointtoEdge(cTI.p, this.edges[i3])
    let info4:IntersectionInfo = colservice.distPointtoEdge(cTI.p, this.edges[i4])

    let dist2:number = info2.distofPoint != undefined             ? info2.distofPoint : Number.POSITIVE_INFINITY
    let dist0:number = info0.distofPoint != undefined && i0 != i2 ? info0.distofPoint : Number.POSITIVE_INFINITY
    let dist1:number = info1.distofPoint != undefined && i1 != i2 ? info1.distofPoint : Number.POSITIVE_INFINITY
    let dist3:number = info3.distofPoint != undefined             ? info3.distofPoint : Number.POSITIVE_INFINITY
    let dist4:number = info4.distofPoint != undefined             ? info4.distofPoint : Number.POSITIVE_INFINITY

    let minDist:number = Math.min(dist0, dist1, dist2, dist3, dist4)
    let lapcompleted:boolean = false

    if (dist4 == minDist && info4.t2 != undefined){
      cTI.relativePositionOnTrack = this.summedDistances[i4] - this.distances[i4] * (0.9 - 0.9*Math.max(0,info4.t2) - 0.1*(Math.max(-1,Math.min(0,info4.t2))));
      cTI.lastCheckpointEdgeID = i4;
      cTI.movedBackwards = false;
      if(i4 < i2)lapcompleted = true;
    }
    else if (dist3 == minDist && info3.t2 != undefined){
      cTI.relativePositionOnTrack = this.summedDistances[i3] - this.distances[i3] * (0.9 - 0.9*Math.max(0,info3.t2) - 0.1*(Math.max(-1,Math.min(0,info3.t2))));
      cTI.lastCheckpointEdgeID = i3;
      cTI.movedBackwards = false;
      if(i3 < i2)lapcompleted = true;
    }
    else if (dist2 == minDist && info2.t2 != undefined){
      cTI.relativePositionOnTrack = this.summedDistances[i2] - this.distances[i2] * (0.9 - 0.9*Math.max(0,info2.t2) - 0.1*(Math.max(-1,Math.min(0,info2.t2))));
      cTI.lastCheckpointEdgeID = i2;
      cTI.movedBackwards = cTI.relativePositionOnTrack < prevPos ? true : false;
    }
    else if (dist1 == minDist && info1.t2 != undefined){
      cTI.relativePositionOnTrack = this.summedDistances[i1] - this.distances[i1] * (0.9 - 0.9*Math.max(0,info1.t2) - 0.1*(Math.max(-1,Math.min(0,info1.t2))));
      cTI.lastCheckpointEdgeID = i1;
      cTI.movedBackwards = true;
    } 
    else if (dist0 == minDist && info0.t2 != undefined){
      cTI.relativePositionOnTrack = this.summedDistances[i0] - this.distances[i0] * (0.9 - 0.9*Math.max(0,info0.t2) - 0.1*(Math.max(-1,Math.min(0,info0.t2))));
      cTI.lastCheckpointEdgeID = i0;
      cTI.movedBackwards = true;
    }




    if(lapcompleted){
      cTI.lapsCompleted += 1; 
      let curTime:number = this.carGameAgentService.curSimulationTime
      let lastTime:number = cTI.lapTimes.length > 0 ? cTI.lapTimes[cTI.lapTimes.length-1] : 0
      cTI.lapTimes.push(curTime)
      cTI.fastestLapTime = Math.min(cTI.fastestLapTime, curTime - lastTime)
    }
    
  }
}

export class LineBarrier{
  public id:string
  public edge:edge={p1:{x:0, y:0},p2:{x:0, y:0}}

  constructor(id:string, edge:edge){
    if(edge.p1.x == edge.p2.x && edge.p1.y == edge.p2.y){throw Error("LineBarrier not valid for to eqaul points")};
    this.id = id;
    this.edge = edge;
  }
  draw(ctx:CanvasRenderingContext2D){
    ctx.beginPath();
    ctx.moveTo(this.edge.p1.x, this.edge.p1.y);
    ctx.lineTo(this.edge.p2.x, this.edge.p2.y);
    ctx.stroke();
  }
}

export class CircleBarrier{
  public id:string
  public circlePart:circlePart={
    origin : {x:0, y:0},
    radius : 0,
    startAngle : 0,
    stopAngle : 0,
  }
  constructor(id:string, circlePart:circlePart){
    if(circlePart.radius == 0 || circlePart.startAngle == circlePart.stopAngle){throw Error("CircleBarrier not valid with a radius of 0 or startAngle == stopAngle")}
    this.id = id
    this.circlePart = circlePart;
  }
  draw(ctx:CanvasRenderingContext2D){
    ctx.beginPath();
    ctx.arc(this.circlePart.origin.x, this.circlePart.origin.y, this.circlePart.radius, this.circlePart.startAngle, this.circlePart.stopAngle);
    ctx.stroke();
  }
}

export class DistSensor{
  public measurableDistance:number
  public distanceToCollision:number 
  public intersectionInfo:IntersectionInfo = {intersecting:false, colliding:false, p:null, t1:Number.POSITIVE_INFINITY}
  public focusedPoint:point = {x:0,y:0}
  public rootCar:Car
  public rPCHC:[number,number,number,number]
  public relativeangle:number = 0
  public absoluteangle:number = this.relativeangle
  public curCOS: number = Math.cos(this.absoluteangle)
  public curSIN: number = Math.sin(this.absoluteangle)
  public edge:edge = {p1:{x:0,y:0},p2:{x:0,y:1}}
  constructor(car:Car, relativeangle:number, relPositionCarFrameCode:[number,number,number,number]){
    this.rootCar = car
    this.rPCHC = relPositionCarFrameCode
    this.relativeangle = relativeangle
    this.measurableDistance = this.rootCar.carGameAgentService.sensorMaxMeasureDistance * this.rootCar.carGameAgentService.pixelPerMeter
    this.distanceToCollision = this.measurableDistance
    this.updateGeneralPosition() 
  }

  updateGeneralPosition(){
    this.absoluteangle = this.rootCar.angle + this.relativeangle
    this.curCOS = Math.cos(this.absoluteangle)
    this.curSIN = Math.sin(this.absoluteangle)

    this.edge.p1.x =  (this.rootCar.prearleft.x*this.rPCHC[0] + this.rootCar.pfrontleft.x*this.rPCHC[1] + this.rootCar.pfrontright.x*this.rPCHC[2] 
      + this.rootCar.prearright.x*this.rPCHC[3])/(this.rPCHC[0]+this.rPCHC[1]+this.rPCHC[2]+this.rPCHC[3])
    this.edge.p1.y =  (this.rootCar.prearleft.y*this.rPCHC[0] + this.rootCar.pfrontleft.y*this.rPCHC[1] + this.rootCar.pfrontright.y*this.rPCHC[2] 
      + this.rootCar.prearright.y*this.rPCHC[3])/(this.rPCHC[0]+this.rPCHC[1]+this.rPCHC[2]+this.rPCHC[3])
    this.edge.p2 = {x:this.curCOS*this.measurableDistance+this.edge.p1.x, y:this.curSIN*this.measurableDistance+this.edge.p1.y}
    this.focusedPoint = this.edge.p2
  }

  update(){
    this.updateGeneralPosition()

    this.intersectionInfo = this.rootCar.carGameAgentService.grid.checkCollisionsofEdge(this.edge)

    if(this.intersectionInfo.colliding && this.intersectionInfo.p!= null){
      this.focusedPoint = this.intersectionInfo.p;
      this.distanceToCollision = this.intersectionInfo.t1*this.measurableDistance 
    }
    else{
      this.focusedPoint = this.edge.p2
      this.distanceToCollision = this.measurableDistance 
    }
  }
  draw(ctx:CanvasRenderingContext2D){
    ctx.beginPath();
    ctx.moveTo(this.edge.p1.x, this.edge.p1.y);
    ctx.lineTo(this.focusedPoint.x, this.focusedPoint.y);
    ctx.strokeStyle = "lightgrey"
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#3f51b5"
    if(this.rootCar.leader == true)ctx.strokeStyle = "#ff4081";
    if(this.rootCar.crashed == true)ctx.strokeStyle = "grey";
    ctx.arc(this.focusedPoint.x, this.focusedPoint.y, 5, 0, 2*Math.PI);
    ctx.stroke();
    ctx.strokeStyle = "black"
  }
}

export class Car {

  // Pedals and Steering
  public throttleInput:number = 0 // 0-1
  public brakeInput:number = 0 // 0-1
  public steeringInput:number = 0 // -1 - 1

  //stats
  public stats:carStats
  public l:number
  public lv:number
  public lh:number
  public maxFrictionAcc:number
  public theoreticalTopSpeed:number   
  public momentOfInertiaZ:number  // kgm^2 see: https://www.colliseum.eu/wiki/Approximation_von_Tr%C3%A4gheitsmomenten_bei_Personenkraftwagen


  // physics
  private _g:number = 9.81 // m/s^2
  private _airDensity:number = 1.2 // kg/m^3
  public startingPosition:point
  public position:point  // pixel
  public startingAngle:number = START_ANGLE // rad
  public angle:number = 0 // rad
  public deltaV:number = 0 // rad
  public beta:number = 0 // rad
  public betaRate:number = 0 //rad
  public alphaV:number = 0 // rad
  public alphaH:number = 0 // rad
  public frictionbasedRadius:number =  Number.POSITIVE_INFINITY // meter
  public theoreticalturningRadius:number  =  Number.POSITIVE_INFINITY // meter
  public turningRadius:number = Number.POSITIVE_INFINITY // meter
  public yawRate:number = 0 // rad/s
  public velocity:number = 0 // m/s
  public acceleration:number = 0 // m/s^2
  public zentripetalAcceleration:number = 0 // m/s^2
  public combinedAcceleration:number = 0 // m/s^2
  public optimalFrictionUsage:number = 0
  public optimalFrictionUsageSummed:number = 0

  // from last iteration
  public lastAcceleration:number = 0 // m/s^2
  public lastZentripetalAcceleration:number = 0 // m/s^2
  public lastcombinedAcceleration:number = 0 // m/s^2

  // css
  public color:string = "#3f51b5"

  // For collision detection and drawing
  public curCOS: number = Math.cos(this.angle)
  public curSIN: number = Math.sin(this.angle)
  public pixelLength:number 
  public pixelWidth:number 
  public prearleft!: point 
  public prearright!: point 
  public pfrontleft!: point 
  public pfrontright!: point 
  public gameHeight: number
  public gameWidth: number

  // sensors
  public distsensors:DistSensor[] = []

  // Info state on track
  public crashed:boolean = false
  public finished:boolean = false
  public inactive:boolean = false
  public leader:boolean = false
  public goneInactiveTimeStamp:number = Number.POSITIVE_INFINITY
  public energyConsumption:number = 0
  public timeMovedBackwards:number = 0
  public timeTractionControlActive:number = 0
  public timeandMagnitudeAtUncomfAcceleration:number = 0
  public summedJerk:number = 0
  public tractionControlActive:boolean = false
  public drivenDistance:number = 0
  public cTI:carTrackInfo
  public endTimeofSimulation:number = Number.POSITIVE_INFINITY

  //services
  public carGameAgentService:CarGameAgentServiceService


  constructor(stats:carStats, distSensorPlans:SensorConstructionPlan[], carGameAgentService:CarGameAgentServiceService){
    this.stats = stats   
    this.l = this.stats.length * 0.85
    this.lv = (this.stats.l_v_dividedBy_l_h/(this.stats.l_v_dividedBy_l_h + 1)) * this.l
    this.lh = this.l - this.lv
    this.maxFrictionAcc = this._g * this.stats.tyreFrictionCoefficient // m/s^2
    this.theoreticalTopSpeed = Math.pow((this.stats.drivetrainEfficiency*this.stats.enginePower*1000)/
      (this.stats.frontSurface*this.stats.dragCoefficient*this._airDensity*0.5), 1/3)
    this.momentOfInertiaZ = 0.127 * this.stats.weight * this.l * this.stats.length // kgm^2 see: https://www.colliseum.eu/wiki/Approximation_von_Tr%C3%A4gheitsmomenten_bei_Personenkraftwagen

    this.carGameAgentService = carGameAgentService
    this.gameHeight = carGameAgentService.gameHeight
    this.gameWidth = carGameAgentService.gameWidth
    this.startingPosition = {
      x:carGameAgentService.startPosition.x * carGameAgentService.pixelPerMeter, 
      y:carGameAgentService.startPosition.y * carGameAgentService.pixelPerMeter
    }
    this.position ={x:this.startingPosition.x, y:this.startingPosition.y}
    this.pixelLength = this.stats.length * carGameAgentService.pixelPerMeter
    this.pixelWidth = this.stats.width * carGameAgentService.pixelPerMeter
    this.cTI ={
      p:this.position,
      lastCheckpointEdgeID: 0,
      relativePositionOnTrack: 0,
      movedBackwards:false,
      lapsCompleted:0,
      lapTimes:[],
      fastestLapTime: Number.POSITIVE_INFINITY
    }
    this.computeCornerCoordinates()
    this.initSensors(distSensorPlans)
  }

  initSensors(distSensorPlans:SensorConstructionPlan[]){
    distSensorPlans.forEach((plan:SensorConstructionPlan) => {
      this.distsensors.push(new DistSensor(this, plan.relativeAngle,plan.relPositionCarFrameCode))
    })
  }  

  resetPosPhysicsInputs(){
    this.startingPosition = {
      x:this.carGameAgentService.startPosition.x * this.carGameAgentService.pixelPerMeter, 
      y:this.carGameAgentService.startPosition.y * this.carGameAgentService.pixelPerMeter
    }
    this.position.x = this.startingPosition.x
    this.position.y = this.startingPosition.y
    this.angle = this.startingAngle  
    this.curCOS = Math.cos(this.angle)
    this.curSIN = Math.sin(this.angle)
    this.computeCornerCoordinates()
    this.velocity = 0
    this.acceleration = 0
    this.lastAcceleration = 0
    this.combinedAcceleration = 0
    this.lastcombinedAcceleration = 0
    this.zentripetalAcceleration = 0
    this.lastZentripetalAcceleration = 0
    this.yawRate = 0
    this.turningRadius = Number.POSITIVE_INFINITY
    this.theoreticalturningRadius = Number.POSITIVE_INFINITY
    this.frictionbasedRadius = Number.POSITIVE_INFINITY
    this.brakeInput = 0
    this.throttleInput = 0
    this.steeringInput = 0
    this.crashed = false    
    this.finished = false
    this.leader = false
    this.energyConsumption = 0
    this.tractionControlActive = false
    this.timeMovedBackwards = 0
    this.timeTractionControlActive = 0
    this.summedJerk = 0
    this.timeandMagnitudeAtUncomfAcceleration = 0
    this.safeUpdatecTI()
    this.fastUpdatecTI()
    this.cTI.lapTimes = []
    this.cTI.fastestLapTime = Number.POSITIVE_INFINITY
    this.cTI.lapsCompleted = 0
    this.drivenDistance = 0
    this.endTimeofSimulation = Number.POSITIVE_INFINITY
    this.optimalFrictionUsage = 0
    this.optimalFrictionUsageSummed = 0
  }

  draw(ctx:CanvasRenderingContext2D){
    ctx.translate(this.prearleft.x, this.prearleft.y)
    ctx.rotate(this.angle)
    ctx.fillStyle =   this.finished ? "rgb(157, 238, 35)" : 
                      this.leader ? "#ff4081" :
                      this.crashed ? "grey" : 
                      this.color
    ctx.fillRect(0, 0, this.pixelLength, this.pixelWidth)
    if (this.leader && this.carGameAgentService.showCheckpoints){
      ctx.fillStyle = "white";
      ctx.font = `${this.pixelWidth*0.8}px roboto`
      ctx.fillText(`${(Math.round(1000*(this.cTI.relativePositionOnTrack + this.cTI.lapsCompleted))/10)}%`, 1, this.pixelWidth *0.8, this.pixelLength);
    }
    ctx.rotate(-this.angle)
    ctx.translate(-this.prearleft.x, -this.prearleft.y)
    if((this.carGameAgentService.aICarConstructionPlan.giveSensors) && (this.carGameAgentService.showSensors || (this.leader && this.carGameAgentService.showSensorsonLeader))){
      this.distsensors.forEach((sensor:DistSensor)=>{sensor.draw(ctx)})
    }
    if(this.leader && this.carGameAgentService.showCheckpoints){
      this.carGameAgentService.drawEdge(this.carGameAgentService.checkPoints.edges[this.cTI.lastCheckpointEdgeID], "#ff4081")
    }
  }

  update(deltaTime:number){
    if (this.crashed || this.finished || deltaTime == 0) {return}
    this.computeAccelaration(deltaTime)
    this.computeVelocity(deltaTime)
    this.computePositionandAngle(deltaTime)  
    this.distsensors.forEach((sensor:DistSensor)=>{sensor.update()})
    this.collisionCheck()
    this.fastUpdatecTI()  
    this.carInfoUpdate(deltaTime)
  }

  carInfoUpdate(deltaTime:number){
    this.l = this.stats.length * 0.85
    this.lv = (this.stats.l_v_dividedBy_l_h/(this.stats.l_v_dividedBy_l_h + 1)) * this.l
    this.lh = this.l - this.lv
    this.theoreticalTopSpeed = Math.pow((this.stats.drivetrainEfficiency*this.stats.enginePower*1000)/
      (this.stats.frontSurface*this.stats.dragCoefficient*this._airDensity*0.5), 1/3)
    this.momentOfInertiaZ = 0.127 * this.stats.weight * this.l * this.stats.length 
    this.pixelLength = this.stats.length * this.carGameAgentService.pixelPerMeter
    this.pixelWidth = this.stats.width * this.carGameAgentService.pixelPerMeter

    if(this.cTI.lapsCompleted == this.carGameAgentService.stopAfterXLaps)this.finished = true;
    if(this.velocity < this.carGameAgentService.inactiveVelocity){this.inactive = true}
    if(this.finished || this.crashed || this.inactive){this.goneInactiveTimeStamp = this.carGameAgentService.curSimulationTime;}
    this.energyConsumption += this.throttleInput * deltaTime * this.stats.enginePower/this.stats.engineEfficiency * 1000
    this.drivenDistance += this.velocity * deltaTime 
    this.timeMovedBackwards += this.cTI.movedBackwards ? deltaTime : 0
    this.timeTractionControlActive += this.tractionControlActive ? deltaTime : 0
    this.summedJerk += deltaTime > 0 ? Math.abs(this.combinedAcceleration - this.lastcombinedAcceleration): 0
    this.timeandMagnitudeAtUncomfAcceleration += Math.max(0, this.combinedAcceleration - this.stats.uncomfAcceleration) * deltaTime
    this.optimalFrictionUsageSummed += this.optimalFrictionUsage * deltaTime
  }

  computeAccelaration(deltaTime:number){ 
    this.maxFrictionAcc = (this.getabsFDownforce()/this.stats.weight + this._g) * this.stats.tyreFrictionCoefficient
    let correction_factor_v:number = 1
    let correction_factor_h:number = 1

    let l:number = this.l
    let forceFraction_v:number = (this.lh*this.maxFrictionAcc - this.acceleration * this.stats.centerofGravityHeigth)/(l*this.maxFrictionAcc)
    let forceFraction_h:number = (this.lv*this.maxFrictionAcc + this.acceleration * this.stats.centerofGravityHeigth)/(l*this.maxFrictionAcc)
    let m:number = this.stats.weight
    let c_s_v:number = this.stats.skewStiffnessCoefficientV
    let c_s_h:number = this.stats.skewStiffnessCoefficientH

    let goaldeltaV:number = this.steeringInput * this.stats.MaxsteeringAngle * Math.PI/180
    let deltaVoffset:number = this.deltaV - goaldeltaV
    this.deltaV -= Math.sign(deltaVoffset) * Math.min(Math.abs(deltaVoffset), 5 * deltaTime) // delta x° per second max

    this.beta = 0
    this.alphaV = this.beta - (this.lv / (this.turningRadius)) + this.deltaV
    this.alphaH = this.beta + (this.lv / (this.turningRadius))

    let a_v:number = Math.abs(this.alphaV *180/Math.PI)
    let a_h:number = Math.abs(this.alphaH *180/Math.PI) 
   
    let wish_acc_cross_tyre_v:number = Math.sign(this.velocity) * Math.sign(this.alphaV) * this.maxFrictionAcc * 
        1.3*(1-Math.exp(-a_v*c_s_v/(170000))) * (-0.4/(1+Math.exp((450000/c_s_v-a_v)*c_s_v/130000))+1) // tyre side force "efficiency" - tyre model
    let wish_acc_cross_tyre_h:number = Math.sign(this.velocity) * Math.sign(this.alphaH) * this.maxFrictionAcc * 
        1.3*(1-Math.exp(-a_h*c_s_h/(170000))) * (-0.4/(1+Math.exp((450000/c_s_h-a_h)*c_s_h/130000))+1) // tyre side force "efficiency" - tyre model

    let acc_air_drag:number = this.getabsFAirdrag() / m
    let engine_acc:number = this.getabsmaxaccengine() * (1 - this.brakeInput) * this.throttleInput
    
    let wish_acc_longitudinal_tyre_v:number =  Math.min(this.maxFrictionAcc, engine_acc - this.getabsaccbrake() - this.getabsaccRoll())
    let wish_acc_longitudinal_tyre_h:number =  wish_acc_longitudinal_tyre_v

    let wish_acc_combined_v:number = Math.hypot(wish_acc_longitudinal_tyre_v, wish_acc_cross_tyre_v)
    let wish_acc_combined_h:number = Math.hypot(wish_acc_longitudinal_tyre_h, wish_acc_cross_tyre_h)
    this.tractionControlActive =  false
    if (wish_acc_combined_v >= this.maxFrictionAcc) { //Friction cant handle both acceleration wishes 
      this.tractionControlActive = true
      correction_factor_v = this.maxFrictionAcc/wish_acc_combined_v
    }
    if (wish_acc_combined_h >= this.maxFrictionAcc) { //Friction cant handle both acceleration wishes 
      this.tractionControlActive = true
      correction_factor_h = this.maxFrictionAcc/wish_acc_combined_h
    } 

    wish_acc_cross_tyre_v *= correction_factor_v * forceFraction_v 
    wish_acc_longitudinal_tyre_v *= correction_factor_v * forceFraction_v 
    wish_acc_cross_tyre_h *= correction_factor_h * forceFraction_h
    wish_acc_longitudinal_tyre_h *= correction_factor_h * forceFraction_h

    let cos_v = Math.cos(this.alphaV)
    let sin_v = Math.sin(this.alphaV)
    let cos_h = Math.cos(this.alphaH)
    let sin_h = Math.sin(this.alphaH)

    this.lastZentripetalAcceleration = this.zentripetalAcceleration
    let rawZentAcc:number = wish_acc_cross_tyre_v * cos_v + wish_acc_cross_tyre_h * cos_h
    let circInfluenc:number = wish_acc_longitudinal_tyre_v * sin_v - wish_acc_longitudinal_tyre_h * sin_h
    this.zentripetalAcceleration = Math.abs(rawZentAcc * 0.2) > Math.abs(rawZentAcc + circInfluenc) || Math.sign(rawZentAcc) != Math.sign(rawZentAcc + circInfluenc) ? 
      rawZentAcc * 0.2 : rawZentAcc + circInfluenc   

    this.lastAcceleration = this.acceleration
    this.acceleration = 
      wish_acc_longitudinal_tyre_v * cos_v 
      + wish_acc_longitudinal_tyre_h * cos_h 
      - Math.abs(wish_acc_cross_tyre_v * sin_v) 
      + Math.abs(wish_acc_cross_tyre_h * sin_h) 
      - acc_air_drag

    this.lastcombinedAcceleration = this.combinedAcceleration
    this.combinedAcceleration =  Math.hypot(this.zentripetalAcceleration, this.acceleration)

    this.optimalFrictionUsage = Math.hypot(this.acceleration + acc_air_drag, this.zentripetalAcceleration) / this.maxFrictionAcc       

    this.theoreticalturningRadius = this.deltaV != 0 ? l/Math.sin(this.deltaV) : Number.POSITIVE_INFINITY
    this.frictionbasedRadius =  this.zentripetalAcceleration != 0 ? (Math.pow(this.velocity,2))/(this.zentripetalAcceleration) : Number.POSITIVE_INFINITY
    this.turningRadius =  Math.max(Math.abs(this.theoreticalturningRadius), Math.abs(this.frictionbasedRadius))
    if(Math.abs(this.turningRadius) > 99999) this.turningRadius = Number.POSITIVE_INFINITY ;  
    this.turningRadius *=  this.zentripetalAcceleration > 0 ? 1 : -1            
              
  }

  getabsaccRoll(){return Math.sign(this.velocity)*this.stats.rollingResistanceCoefficient*this._g}
  getabsFAirdrag(){return Math.sign(this.velocity)*this.stats.frontSurface*this.stats.dragCoefficient*this._airDensity*0.5*Math.pow(this.velocity, 2)}
  getabsFDownforce(){return Math.sign(this.velocity)*this.stats.frontSurface*this.stats.liftCoefficient*this._airDensity*0.5*Math.pow(this.velocity, 2)}
  getabsaccbrake(){return Math.sign(this.velocity)*this.maxFrictionAcc*this.brakeInput}
  getabsmaxaccengine(){return this.stats.drivetrainEfficiency* Math.min(
    (this.stats.enginePower*1000)/(Math.max(Math.abs(this.velocity),1)*this.stats.weight), 
    this.stats.engineTorque*this.stats.enginetoTyreRatio/(this.stats.tyreRadius*this.stats.weight)
  )} 

  computeVelocity(deltaTime:number){
    let newVelocity:number = this.acceleration * deltaTime + this.velocity
    this.velocity = newVelocity < 0 ?  0 : newVelocity
  }

  computePositionandAngle(deltaTime:number){ //angle direction vecot and position
    if (this.velocity == 0) {return}
    this.yawRate = this.velocity / this.turningRadius 
    this.angle += this.yawRate * deltaTime 
    this.angle = this.angle % (Math.PI*2)
    if(this.angle < 0){this.angle = Math.PI*2 - this.angle}

    this.curCOS = Math.cos(this.angle); 
    this.curSIN = Math.sin(this.angle); 
    
    this.position.x += this.velocity * this.curCOS * deltaTime * this.carGameAgentService.pixelPerMeter
    this.position.y += this.velocity * this.curSIN * deltaTime * this.carGameAgentService.pixelPerMeter

    this.computeCornerCoordinates()
  }

  computeCornerCoordinates(){    
    this.prearleft = {x: this.position.x - this.curCOS * this.pixelLength*0.5 + this.curSIN * this.pixelWidth*0.5, 
      y: this.position.y - this.curCOS * this.pixelWidth*0.5 - this.curSIN * this.pixelLength*0.5}
    this.prearright = {x: this.prearleft.x - this.curSIN * this.pixelWidth, y: this.prearleft.y + this.curCOS * this.pixelWidth}
    this.pfrontleft = {x: this.prearleft.x + this.curCOS * this.pixelLength, y: this.prearleft.y + this.curSIN * this.pixelLength}
    this.pfrontright = {x: this.prearright.x + this.curCOS * this.pixelLength, y: this.prearright.y + this.curSIN * this.pixelLength}
  }

  collisionCheck(){
    if(this.carGameAgentService.grid.checkCollisionsofEdge({p1:this.prearleft,p2:this.pfrontleft}).colliding||
      this.carGameAgentService.grid.checkCollisionsofEdge({p1:this.pfrontleft,p2:this.pfrontright}).colliding||
      this.carGameAgentService.grid.checkCollisionsofEdge({p1:this.pfrontright,p2:this.prearright}).colliding||
      this.carGameAgentService.grid.checkCollisionsofEdge({p1:this.prearright,p2:this.prearleft}).colliding
    ){this.crashed = true}
  }

  safeUpdatecTI(){
    this.carGameAgentService.checkPoints.safeCarTrackInfoUpdate(this.cTI)
  }

  fastUpdatecTI(){
    this.carGameAgentService.checkPoints.fastCarTrackInfoUpdate(this.cTI) 
  }

  status(){
    return this.finished ? "finished" : this.crashed ? "crashed" : "active"
  }
}

export class AICar extends Car{
  public aICarConstructionPlan:aICarConstructionPlan
  public FFneuralnetwork:FFneuralnetwork
  public fitness:number = 0
  constructor(stats:carStats, plan:aICarConstructionPlan, carGameAgentService:CarGameAgentServiceService){
    super(stats, plan.distSensors, carGameAgentService);
    this.aICarConstructionPlan = plan
    this.FFneuralnetwork = new FFneuralnetwork(plan.networkPlan, carGameAgentService.neuralNetworkService)
  }

  getCopy(){
    let copy:AICar = new AICar(this.stats, this.aICarConstructionPlan, this.carGameAgentService)
    copy.fitness = this.fitness
    copy.FFneuralnetwork.setGenotype(this.FFneuralnetwork.getGenotype())
    copy.cTI.fastestLapTime = this.cTI.fastestLapTime
    copy.cTI.lapTimes = [...this.cTI.lapTimes]
    copy.cTI.lapsCompleted= this.cTI.lapsCompleted
    copy.cTI.lastCheckpointEdgeID =this.cTI.lastCheckpointEdgeID
    copy.cTI.movedBackwards = this.cTI.movedBackwards
    copy.position = {x:this.position.x, y:this.position.y}
    copy.cTI.p = copy.position
    copy.cTI.relativePositionOnTrack =this.cTI.relativePositionOnTrack
    copy.finished = this.finished 
    copy.inactive =this.inactive
    copy.leader = this.leader
    copy.goneInactiveTimeStamp = this.goneInactiveTimeStamp
    copy.energyConsumption = this.energyConsumption
    copy.timeMovedBackwards = this.timeMovedBackwards
    copy.timeTractionControlActive = this.timeTractionControlActive
    copy.timeandMagnitudeAtUncomfAcceleration = this.timeandMagnitudeAtUncomfAcceleration
    copy.summedJerk = this.summedJerk
    copy.tractionControlActive = this.tractionControlActive
    copy.crashed = this.crashed
    copy.curCOS  = this.curCOS
    copy.curSIN = this.curSIN
    copy.pixelLength = this.pixelLength
    copy.pixelWidth = this.pixelWidth
    copy.prearleft = {x:this.prearleft.x, y:this.prearleft.y}
    copy.prearright = {x:this.prearright.x, y:this.prearright.y}
    copy.pfrontleft = {x:this.pfrontleft.x, y:this.pfrontleft.y}
    copy.pfrontright = {x:this.pfrontright.x, y:this.pfrontright.y}
    copy.gameHeight = this.gameHeight
    copy.gameWidth = this.gameWidth
    copy.throttleInput = this.throttleInput
    copy.brakeInput = this.brakeInput
    copy.steeringInput = this.steeringInput
    copy.startingAngle = this.startingAngle 
    copy.angle = this.angle
    copy.frictionbasedRadius = this.frictionbasedRadius
    copy.theoreticalturningRadius  =  this.theoreticalturningRadius
    copy.turningRadius = this.turningRadius
    copy.yawRate = this.yawRate
    copy.velocity = this.velocity
    copy.acceleration = this.acceleration
    copy.zentripetalAcceleration =this.zentripetalAcceleration
    copy.combinedAcceleration = this.combinedAcceleration
    copy.lastAcceleration = this.lastAcceleration
    copy.lastZentripetalAcceleration = this.lastZentripetalAcceleration
    copy.lastcombinedAcceleration = this.lastcombinedAcceleration
    copy.drivenDistance = this.drivenDistance
    copy.endTimeofSimulation = this.endTimeofSimulation
    copy.optimalFrictionUsage = this.optimalFrictionUsage 
    copy.optimalFrictionUsageSummed = this.optimalFrictionUsageSummed 
    return copy
  }

  letAIupdatePeripheralSettings(deltatime:number){
    if (this.crashed || this.finished || deltatime == 0) {return};
    let inputs:number[] = []
    if (this.aICarConstructionPlan.giveSensors) inputs.push(...this.distsensors.map(distSensor => distSensor.distanceToCollision/distSensor.measurableDistance));
    if (this.aICarConstructionPlan.givePosition) inputs.push(this.cTI.relativePositionOnTrack);
    if (this.aICarConstructionPlan.giveVelocity) inputs.push(this.velocity/this.theoreticalTopSpeed);
    if (this.aICarConstructionPlan.giveAcceleration) inputs.push(this.acceleration/this.maxFrictionAcc);
    if (this.aICarConstructionPlan.giveZentripetalAcceleration) inputs.push(this.zentripetalAcceleration/this.maxFrictionAcc);

    let prediction:number[] = this.FFneuralnetwork.predict(inputs)
    
    if (this.aICarConstructionPlan.mergeThrottleandBreak){
      this.throttleInput = Math.min(1, Math.max(0, prediction[0] ))
      this.brakeInput = Math.min(1, Math.max(0, prediction[0]*-1 ))
      this.steeringInput = Math.min(1, Math.max(-1, prediction[1]))
    }else{
      this.throttleInput = Math.min(1, Math.max(0, (prediction[0])))
      this.brakeInput = Math.min(1, Math.max(0, (prediction[1]) ))
      this.steeringInput = Math.min(1, Math.max(-1, prediction[2]))
    }
  }
}


@Injectable({
  providedIn: 'root'
})
export class CarGameAgentServiceService {

  //Toolbar
  public carAISideNavOpened:boolean = false;
  public currentlyTraining:boolean = false;
  public loopControlButton:string = "start";
  public activationFunctionIDs:optionAsStringID[] = [
    {id:"ReLU", viewvalue: "ReLU"},
    {id:"LeakyReLU", viewvalue: "Leaky ReLU"},
    {id:"softplus", viewvalue: "Softplus"},
    {id:"sigmoid", viewvalue: "Sigmoid"},
    {id:"tanh", viewvalue: "Hyperbolic Tangent"},
  ]
  public selectionFunctionIDs:optionAsStringID[] = [
    {id:"topXPercentSelecetion", viewvalue: "Top x Percent Selection"},
    {id:"tournamentSelection", viewvalue: "Tournament Selection"},
    {id:"rouletteSelection", viewvalue: "Roulette Selection"},  
  ]
  public averageDistance:number = 0
  public computationalPerformanceIndicator:number = 100
  public computationalLimitEvaluation:string = "excellent"


  // Canvas
  public ctx!: CanvasRenderingContext2D;
  public canvas!: HTMLCanvasElement;
  public pixelPerMeter:number = PIXEL_PER_METER
  public unscaledWidth:number = GAME_WIDTH
  public unscaledHeight:number = GAME_HEIGTH
  public gameWidth:number = this.unscaledWidth * this.pixelPerMeter;
  public gameHeight:number = this.unscaledHeight * this.pixelPerMeter;
  

  // Track and Render Stuff
  public AIcars:AICar[] = []
  public showPercentofTrackFinishedonCar:boolean = false
  public showSensors:boolean = false
  public showSensorsonLeader:boolean = true
  public lineBarriers:LineBarrier[] = []
  public circleBarriers:CircleBarrier[] = []
  public checkPoints!:Checkpoints 
  public showCheckpoints:boolean = true
  public tracks: track[] = TRACKS
  public selectedTrack:track = this.tracks[SELECTED_TRACK_ID]
  public startPosition:point  = this.selectedTrack.startPosition

  // Collision
  public grid!:Grid 

  // Looping Logic
  public stopEvolutionLoop:boolean = false
  public evolutionLoopRunning:boolean = false
  public gameLoopRunning:boolean = false
  public canStopCurrentGen:boolean = false
  public timePerGeneration:number = TIME_CAP_PER_GENERATION //ms
  public carsMoving:number = 0
  public lastTime:number = 0
  public frame:number = 0
  public singlePlayerFrame:number = 0
  public startframe:number = 0
  public curSimulationTime:number = 0
  public curRealTime:number = 0
  public stopAfterXLaps:number = MAX_LAPS
  public inactiveVelocity:number = 1
  public speedFactor:number = SPEED_UP_FACTOR
  public singlePlayerMode:boolean = false

  // AI 
  public generation:number = 1
  public populationSize:number = POPULATION_SIZE
  public maxPopulation:number = 1000
  public aICarConstructionPlan:aICarConstructionPlan = AI_CAR_CONSTRUCTION_PLAN
  public carStats:carStats = CAR_STATS
  public sensorMaxMeasureDistance:number = 50 // m
  public networkPlan:networkPlan = this.aICarConstructionPlan.networkPlan
  public copiedAICarConstructionPlan:aICarConstructionPlan = {
    networkPlan:{
      hiddenLayerSizes:[...this.networkPlan.hiddenLayerSizes],
      activationFunctionId:this.networkPlan.activationFunctionId,
      inputs:this.networkPlan.inputs,
      outputs:this.networkPlan.outputs,
    },
    distSensors:this.aICarConstructionPlan.distSensors,
    giveSensors:this.aICarConstructionPlan.giveSensors,
    givePosition:this.aICarConstructionPlan.givePosition,
    giveVelocity:this.aICarConstructionPlan.giveVelocity,
    giveAcceleration:this.aICarConstructionPlan.giveAcceleration,
    giveZentripetalAcceleration:this.aICarConstructionPlan.giveZentripetalAcceleration,
    mergeThrottleandBreak:this.aICarConstructionPlan.mergeThrottleandBreak,
    }
  public breedingInfo:breedingInfo = BREEDING_INFO
  public fitnessFunctionInfo:fitnessFunctionInfo = FITNESS_FUNCTION_INFO

  // Cars
  public theFittest:AICar = new AICar(this.carStats, this.aICarConstructionPlan, this)
  public theFittestCopy:AICar = new AICar(this.carStats, this.aICarConstructionPlan, this)
  public steerableCar:AICar = new AICar(this.carStats, this.aICarConstructionPlan, this)
  public leaderCar:AICar = new AICar(this.carStats, this.aICarConstructionPlan, this)
  public sensorsModded:boolean = false;
  public neuralNetworkModded:boolean = false;

 





  constructor(public collisionservice:CollisionDetectionService, public neuralNetworkService:NeuralNetworkService) {  }

  handOverCanvas(carAIcanvas: ElementRef){
    this.canvas = carAIcanvas.nativeElement
    this.ctx = carAIcanvas.nativeElement.getContext("2d")
    this.createGame()
  }

  createGame(){
    this.gameWidth = GAME_WIDTH * this.pixelPerMeter
    this.gameHeight = GAME_HEIGTH * this.pixelPerMeter
    this.canvas.width = this.gameWidth 
    this.canvas.height = this.gameHeight 
    this.generation = 1
    this.carsMoving = 0
    this.averageDistance = 0
    this.breedingInfo.totalFitness = 0
    this.curRealTime = 0
    this.curSimulationTime = 0
    this.frame = 0
    
    this.createMap()
    this.updateInputsOutputsofAINetwork()
    this.createCars()
    this.updateSensors()
    this.sensorsModded = false

    this.renderOneFrame()
  }

  renderOneFrame(){
    if(this.gameLoopRunning){return}
    this.clearCanvas()
    this.renderTrack()
    this.renderCars(0)
  }

  loadNewTrack(){
    this.carsMoving = 0
    this.curRealTime = 0
    this.curSimulationTime = 0
    this.frame = 0
    this.createMap()
    this.AIcars.forEach((aIcar:AICar) => {aIcar.resetPosPhysicsInputs()})
    this.updateSensors()
    this.renderOneFrame()
  }

  resetGame(){
    if(this.singlePlayerMode){
      this.steerableCar.resetPosPhysicsInputs()
      this.steerableCar.leader = true
      this.curSimulationTime = 0
      this.curRealTime = 0
      this.averageDistance = 0
      this.lastTime = Date.now()
      return
    }
    if(this.neuralNetworkModded){
      this.aICarConstructionPlan = {
        networkPlan:{
          hiddenLayerSizes:[...this.copiedAICarConstructionPlan.networkPlan.hiddenLayerSizes],
          activationFunctionId:this.copiedAICarConstructionPlan.networkPlan.activationFunctionId,
          inputs:this.copiedAICarConstructionPlan.networkPlan.inputs,
          outputs:this.copiedAICarConstructionPlan.networkPlan.outputs,
        },
        distSensors:this.aICarConstructionPlan.distSensors, // with purpose the same
        giveSensors:this.copiedAICarConstructionPlan.giveSensors,
        givePosition:this.copiedAICarConstructionPlan.givePosition,
        giveVelocity:this.copiedAICarConstructionPlan.giveVelocity,
        giveAcceleration:this.copiedAICarConstructionPlan.giveAcceleration,
        giveZentripetalAcceleration:this.copiedAICarConstructionPlan.giveZentripetalAcceleration,
        mergeThrottleandBreak:this.copiedAICarConstructionPlan.mergeThrottleandBreak,
        }
      this.neuralNetworkModded = false
    }
    this.createGame()
    this.updateSensors()
  }

  createMap(){
    this.lineBarriers = []
    this.circleBarriers = []
    this.createTrack(FRAME)
    this.startPosition = this.selectedTrack.startPosition
    this.createTrack(this.selectedTrack.constructionPlan, true)
    this.grid = new Grid(this.gameWidth, this.gameHeight, 
      this.circleBarriers, this.lineBarriers, this.collisionservice, this.ctx, GRID_CELL_DIM)   
  }

  updateInputsOutputsofAINetwork(){
    this.aICarConstructionPlan.networkPlan.inputs = 0
    this.aICarConstructionPlan.networkPlan.inputs +=  this.aICarConstructionPlan.giveSensors ? this.aICarConstructionPlan.distSensors.length : 0
    this.aICarConstructionPlan.networkPlan.inputs +=  this.aICarConstructionPlan.givePosition ? 1 : 0
    this.aICarConstructionPlan.networkPlan.inputs +=  this.aICarConstructionPlan.giveVelocity ? 1 : 0
    this.aICarConstructionPlan.networkPlan.inputs +=  this.aICarConstructionPlan.giveAcceleration ? 1 : 0
    this.aICarConstructionPlan.networkPlan.inputs +=  this.aICarConstructionPlan.giveZentripetalAcceleration ? 1 : 0

    this.aICarConstructionPlan.networkPlan.outputs = this.aICarConstructionPlan.mergeThrottleandBreak ? 2 : 3
  }

  createCars(){
    this.AIcars = []
    for(let i:number = 0; i < this.populationSize; i++){
      this.AIcars.push(new AICar(this.carStats, this.aICarConstructionPlan, this))
    }
  }

  updateSensors(){
    this.AIcars.forEach((aIcar:AICar) => {
      aIcar.distsensors.forEach((sensor:DistSensor) => {
        sensor.measurableDistance = this.sensorMaxMeasureDistance * this.pixelPerMeter
        sensor.update()
      })
    })    
    this.renderOneFrame()
  }

  startEvolution(){
    this.loopControlButton = "pause"
    this.stopEvolutionLoop = false
    this.evolutionLoopRunning = true
    this.evolutionLoop()
  }

  toggleSinglePlayerMode(){
    if(this.singlePlayerMode){
      this.steerableCar.resetPosPhysicsInputs()
      this.steerableCar.leader = true
      this.leaderCar = this.steerableCar
      this.lastTime = Date.now()
      this.curRealTime = 0
      this.averageDistance = 0
      this.curSimulationTime = 0
      this.startframe = this.frame
      this.gameLoopRunning = true
      this.singlePlayerGameLoop()
    }
    else{
      cancelAnimationFrame(this.singlePlayerFrame);
      this.leaderCar = this.AIcars[0]
      this.steerableCar.leader = false  
      this.gameLoopRunning = false
      this.steerableCar.resetPosPhysicsInputs()
      this.lastTime = Date.now()
      this.curRealTime = 0
      this.averageDistance = 0
      this.curSimulationTime = 0
      this.renderOneFrame()
    }
  }

  singlePlayerGameLoop(){   
    let curtime:number = Date.now()
    let deltatime:number = curtime - this.lastTime
    this.curRealTime += deltatime

    if (deltatime > 0){
      deltatime *= this.speedFactor
      deltatime = Math.min(100, deltatime)
      this.curSimulationTime += deltatime
      this.clearCanvas()
      this.steerableCar.update(deltatime/1000)
      this.steerableCar.draw(this.ctx)
      this.renderTrack()    
    }

    this.lastTime = curtime
    this.singlePlayerFrame = requestAnimationFrame(this.singlePlayerGameLoop.bind(this))
  }

  pauseAfterGeneration(){
    this.loopControlButton = "stop"
    this.stopEvolutionLoop = true
  }

  stopEvolution(){
    this.stopEvolutionLoop = true
    this.canStopCurrentGen = true
  }

  skipToNextGen(){
    this.canStopCurrentGen = true
  }

  async evolutionLoop(){ 
    if (this.stopEvolutionLoop){this.evolutionLoopRunning = false; this.loopControlButton = "start" ;return}
    this.AIcars.forEach((aIcar:AICar) => {aIcar.resetPosPhysicsInputs()})
    this.canStopCurrentGen = false
    this.lastTime = Date.now()
    this.curRealTime = 0
    this.curSimulationTime = 0
    this.startframe = this.frame
    this.gameLoopRunning = true
    this.gameLoop()

    await this.checkContinuationCondition();

    let oldperf:number = this.computationalPerformanceIndicator
    this.computationalPerformanceIndicator = 100*this.curSimulationTime/(this.curRealTime*this.speedFactor)
    if(oldperf < 95 && this.computationalPerformanceIndicator < 95 || this.computationalLimitEvaluation != "excellent"){
      this.computationalLimitEvaluation =  
        this.computationalPerformanceIndicator < 65 ? "bad" : 
        this.computationalPerformanceIndicator < 80 ? "managable" : 
        this.computationalPerformanceIndicator < 95 ? "good" : "excellent"
    }
    
    cancelAnimationFrame(this.frame)
    this.gameLoopRunning = false
    await this.evaluateandBreed()
    this.generation += 1
    this.evolutionLoop()
  }

  async checkContinuationCondition(){ 
    while(this.canStopCurrentGen == false && this.timePerGeneration > this.curSimulationTime){
      await this.sleep(100)
    }
    return
  }

  sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  gameLoop(){   
    let curtime:number = Date.now()
    let deltatime:number = curtime - this.lastTime
    this.curRealTime += deltatime

    if (deltatime > 0){
      deltatime *= this.speedFactor
      deltatime = Math.min(100, deltatime)
      this.curSimulationTime += deltatime
      this.clearCanvas()
      this.renderCars(deltatime/1000)
      this.renderTrack()    
    }

    this.lastTime = curtime
    this.frame = requestAnimationFrame(this.gameLoop.bind(this))
  }

  async evaluateandBreed(){
    let curPopulation:instance[] = []
    let fitnessCount:number = 0
    let fittestAICarSoFar:AICar = this.AIcars[0]
    let topFitnessSoFar:number = 0
    let curInstance:instance
    

    this.computePopulationFitness()

    this.AIcars.forEach((aIcar:AICar) => {
      aIcar.endTimeofSimulation = this.curSimulationTime
      curInstance = aIcar.FFneuralnetwork.getGenotype()
      curInstance.fitness = aIcar.fitness
      curPopulation.push(curInstance);
      fitnessCount += curInstance.fitness;

      if (topFitnessSoFar < curInstance.fitness){
        topFitnessSoFar = curInstance.fitness
        fittestAICarSoFar = aIcar
      } 
    })
    this.breedingInfo.totalFitness = fitnessCount
    this.theFittest = fittestAICarSoFar
    this.theFittestCopy = this.theFittest.getCopy()

    this.breedingInfo.goalPopulationSize = this.populationSize
    let newGeneration:instance[] = this.neuralNetworkService.breedPopulation(curPopulation, this.breedingInfo)

    while(this.AIcars.length != newGeneration.length){
      if(this.AIcars.length < newGeneration.length){this.AIcars.push(new AICar(this.carStats, this.aICarConstructionPlan, this))}
      else{this.AIcars.pop()}
    }

    this.AIcars.forEach((aIcar:AICar, idx:number) => {
      aIcar.FFneuralnetwork.setGenotype(newGeneration[idx])
    })
  }

 

  computePopulationFitness(){
    let energy:numberrange      = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    let TractionCon:numberrange = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    let Jerk:numberrange        = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    let UncomfAcc:numberrange   = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    let time:numberrange        = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    let track:numberrange       = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    let OptFric:numberrange     = {min:Number.POSITIVE_INFINITY, max:Number.NEGATIVE_INFINITY, size: Number.POSITIVE_INFINITY}
    this.averageDistance = 0

    this.AIcars.forEach((aIcar:AICar) => {
      energy.min =        Math.min(energy.min, aIcar.energyConsumption)
      energy.max =        Math.max(energy.max, aIcar.energyConsumption)
      TractionCon.min =   Math.min(TractionCon.min, aIcar.timeTractionControlActive)
      TractionCon.max =   Math.max(TractionCon.max, aIcar.timeTractionControlActive)
      Jerk.min =          Math.min(Jerk.min, aIcar.summedJerk)
      Jerk.max =          Math.max(Jerk.max, aIcar.summedJerk)
      UncomfAcc.min =     Math.min(UncomfAcc.min, aIcar.timeandMagnitudeAtUncomfAcceleration)
      UncomfAcc.max =     Math.max(UncomfAcc.max, aIcar.timeandMagnitudeAtUncomfAcceleration)
      OptFric.min =       Math.min(OptFric.min, aIcar.optimalFrictionUsageSummed)
      OptFric.max =       Math.max(OptFric.max, aIcar.optimalFrictionUsageSummed)

      let trackCompletion:number = aIcar.cTI.lapsCompleted + aIcar.cTI.relativePositionOnTrack
      let timeinterval:number = (aIcar.inactive || aIcar.crashed || aIcar.finished ?  aIcar.goneInactiveTimeStamp : this.curSimulationTime)/1000
      let trackpertime:number = timeinterval > 0 ? trackCompletion / timeinterval : 0
    
      time.min =        Math.min(time.min, trackpertime)
      time.max =        Math.max(time.max, trackpertime)
      track.min =       Math.min(track.min, trackCompletion)
      track.max =       Math.max(track.max, trackCompletion)

      this.averageDistance += trackCompletion
    })

    this.averageDistance /= this.AIcars.length

    energy.size = energy.max - energy.min > 0 ? energy.max - energy.min : Number.POSITIVE_INFINITY
    TractionCon.size = TractionCon.max - TractionCon.min > 0 ? TractionCon.max - TractionCon.min : Number.POSITIVE_INFINITY
    Jerk.size = Jerk.max - Jerk.min > 0 ? Jerk.max - Jerk.min : Number.POSITIVE_INFINITY
    UncomfAcc.size = UncomfAcc.max - UncomfAcc.min > 0 ? UncomfAcc.max - UncomfAcc.min : Number.POSITIVE_INFINITY
    time.size = time.max - time.min > 0 ? time.max - time.min : Number.POSITIVE_INFINITY
    track.size = track.max - track.min > 0 ? track.max - track.min : Number.POSITIVE_INFINITY
    OptFric.size = OptFric.max - OptFric.min > 0 ? OptFric.max - OptFric.min : Number.POSITIVE_INFINITY


    let fitinfo:fitnessFunctionInfo = this.fitnessFunctionInfo

    let factorSum:number = 
    fitinfo.energyConsumptionFactor
    + fitinfo.tractionControlFactor
    + fitinfo.jerkFactor
    + fitinfo.uncomfAccelerationFactor
    + fitinfo.trackCompletionFactor
    + fitinfo.trackpertime
    + fitinfo.optimalFrictionFactor
    
    this.AIcars.forEach((aIcar:AICar) => {
      if(factorSum == 0){
        aIcar.fitness = aIcar.crashed ? 1-fitinfo.collisionPunishmentFactor : 1
      }
      else{
        let trackCompletion:number = aIcar.cTI.lapsCompleted + aIcar.cTI.relativePositionOnTrack
        let timeinterval:number = (aIcar.inactive || aIcar.crashed || aIcar.finished ?  aIcar.goneInactiveTimeStamp : this.curSimulationTime)/1000
        let trackpertime:number = timeinterval > 0 ? trackCompletion / timeinterval : 0

        aIcar.fitness = (
          // Reward
            ((trackCompletion - track.min)/track.size) * fitinfo.trackCompletionFactor 
          + ((trackpertime - time.min) / time.size) * fitinfo.trackpertime
          + ((aIcar.optimalFrictionUsageSummed - OptFric.min) / OptFric.size) * fitinfo.optimalFrictionFactor
          // Punish
          + ((energy.max - aIcar.energyConsumption) / energy.size) * fitinfo.energyConsumptionFactor
          + ((TractionCon.max - aIcar.timeTractionControlActive) / TractionCon.size) * fitinfo.tractionControlFactor
          + ((Jerk.max - aIcar.summedJerk) / Jerk.size) * fitinfo.jerkFactor
          + ((UncomfAcc.max - aIcar.timeandMagnitudeAtUncomfAcceleration) / UncomfAcc.size) * fitinfo.uncomfAccelerationFactor       
          ) * ((aIcar.crashed ? (1-fitinfo.collisionPunishmentFactor) : 1)/factorSum)     
      }
    })
    
  }

  createTrack(ConstructionList:trackConstructionPlanObject[], createCheckpoints:boolean = false){
    if (ConstructionList.length < 3){throw Error("invalid Track: trackConstructionPlan has less then 3 point")}   
    let p0:point = ConstructionList[0].p
    let p1:point = ConstructionList[1].p
    let p2:point 
    let planObject:trackConstructionPlanObject = ConstructionList[2]
    let checkpointList:point[] = []
    for(let idx:number = 2; idx < ConstructionList.length; idx++){    
      planObject = ConstructionList[idx] 
      p2 = planObject.p
      if(planObject.id == "Line"){      
        this.lineBarriers.push(new LineBarrier(`L${this.lineBarriers.length}`, 
        {p1:{x:p1.x*this.pixelPerMeter,y:p1.y*this.pixelPerMeter},  p2:{x:p2.x*this.pixelPerMeter,y:p2.y*this.pixelPerMeter}}));        
      }
      else if(planObject.id == "Circle"){
        this.circleBarriers.push(new CircleBarrier(`C${this.circleBarriers.length}`, this.collisionservice.constructCircle(
         {x:p0.x*this.pixelPerMeter,y:p0.y*this.pixelPerMeter}, {x:p1.x*this.pixelPerMeter,y:p1.y*this.pixelPerMeter},  {x:p2.x*this.pixelPerMeter,y:p2.y*this.pixelPerMeter}))); 
      }
      else if(planObject.id == "Checkpoint"){
        checkpointList.push({x:p2.x*this.pixelPerMeter,y:p2.y*this.pixelPerMeter})
        continue
      }
      else if(planObject.id == "Jump"){}
      else {throw Error("invalid id of trackConstructionPlan")}
      p0 = p1
      p1 = p2
    }
    if(createCheckpoints){this.checkPoints = new Checkpoints(checkpointList, this)}
  }

  renderCars(deltatime:number){
    let earlyBreak:boolean = true
    
    this.carsMoving = 0
    let newLeader:AICar = this.AIcars[0]

    this.AIcars.forEach((aIcar:AICar) => {
      aIcar.letAIupdatePeripheralSettings(deltatime);
      aIcar.update(deltatime); 
      if(newLeader.cTI.relativePositionOnTrack + newLeader.cTI.lapsCompleted < 
        aIcar.cTI.relativePositionOnTrack + aIcar.cTI.lapsCompleted)newLeader = aIcar;
      aIcar.draw(this.ctx);
      if((!aIcar.crashed && aIcar.velocity > 1 && !aIcar.finished)){
        earlyBreak = false;
        this.carsMoving += 1
      }
    })

    this.leaderCar.leader = false
    this.leaderCar = newLeader
    this.leaderCar.leader = true
    this.leaderCar.draw(this.ctx)

    if(this.frame > 200 + this.startframe && earlyBreak){this.canStopCurrentGen = true}
  }

  renderTrack(){
    this.lineBarriers.forEach((linebar:LineBarrier) => {linebar.draw(this.ctx)})
    this.circleBarriers.forEach((circlebar:CircleBarrier) => {circlebar.draw(this.ctx)})
    if(this.showCheckpoints){this.checkPoints.draw(this.ctx)}
  }

  clearCanvas(){
    this.ctx.clearRect(0,0,this.gameWidth , this.gameHeight);
  }

  accelerate(){this.steerableCar.throttleInput = 1}
  brake(){this.steerableCar.brakeInput = 1}
  steerLeft(){this.steerableCar.steeringInput = -1}
  steerRight(){this.steerableCar.steeringInput = 1}

  stopaccelerate(){this.steerableCar.throttleInput = 0}
  stopbrake(){this.steerableCar.brakeInput = 0}
  stopsteerLeft(){this.steerableCar.steeringInput = 0}
  stopsteerRight(){this.steerableCar.steeringInput = 0}

  onClick(event:any){
    //console.log(Math.round(event.layerX/this.pixelPerMeter), Math.round(event.layerY/this.pixelPerMeter))
    if(this.showCheckpoints){
      this.clearCanvas()
      this.checkPoints.draw(this.ctx)  
      this.renderTrack()
      let x = event.layerX
      let y = event.layerY
      this.drawCircle({x,y}, 2, true)
      let temp:carTrackInfo = {
        p:{x,y},
        lastCheckpointEdgeID: 0,
        relativePositionOnTrack :0,
        movedBackwards:false,
        lapTimes:[],
        lapsCompleted:0,
        fastestLapTime:Number.POSITIVE_INFINITY
      }
      this.checkPoints.safeCarTrackInfoUpdate(temp, true)  

      this.checkPoints.fastCarTrackInfoUpdate(temp)  
      this.drawEdge(this.checkPoints.edges[temp.lastCheckpointEdgeID],"red")
      //console.log(Math.round(temp.relativePositionOnTrack*1000000)/10000)
    }
  }

  drawEdge(edge:edge, color: string = "black"){
    this.ctx.beginPath();
    this.ctx.moveTo(edge.p1.x, edge.p1.y);
    this.ctx.lineTo(edge.p2.x, edge.p2.y);
    this.ctx.strokeStyle = color
    this.ctx.stroke();
    this.ctx.strokeStyle = "black"
  }

  drawCircle(p:point, radius:number = 5, fill:boolean = false, color: string = "black"){
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, radius, 0, Math.PI*2);
    this.ctx.strokeStyle = color
    this.ctx.stroke();
    if(fill){this.ctx.fill()}
    this.ctx.strokeStyle = "black"
  }


}
