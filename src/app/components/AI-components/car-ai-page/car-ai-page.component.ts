import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AICar, CarGameAgentServiceService, DistSensor } from '../../../services/AI/car-game-agent-service.service';
import { CollisionDetectionService, track, point, vector, edge, circlePart, carTrackInfo, 
  trackConstructionPlanObject, Grid, IntersectionInfo, } from '../../../services/AI/collision-detection.service';
  import { networkPlan, numberrange, fitnessFunctionInfo, FFneuralnetwork, NeuralNetworkService, breedingInfo, instance,  
    aICarConstructionPlan, SensorConstructionPlan, optionAsStringID} from '../../../services/AI/neural-network.service';

@Component({
  selector: 'app-car-ai-page',
  templateUrl: './car-ai-page.component.html',
  styleUrls: ['./car-ai-page.component.css']
})
export class CarAIPageComponent implements AfterViewInit {

  @ViewChild('showSensorSettingCanvas', {static: false}) showSensorSettingCanvas!: ElementRef;

  public Math:Math = Math
  public Number:NumberConstructor = Number

  // Dummy Car and Sensor Setting
  public sensorCtx!:CanvasRenderingContext2D

  public canvasWidth:number = 300
  public canvasHeigth:number = 200

  public sensorList:SensorConstructionPlan[] = this.carAIService.aICarConstructionPlan.distSensors
  public selectedSensor:SensorConstructionPlan = this.sensorList[0]
  public copiedSensor:SensorConstructionPlan = {relPositionCarFrameCode: [0,3,1,0],relativeAngle: this.toRad(-10)}
  public angle:number =  0
  public curCOS: number = Math.cos(this.angle)
  public curSIN: number = Math.sin(this.angle)
  public pixelLength:number  = 70
  public pixelWidth:number = 35
  public position:point = {x:this.canvasWidth/2 , y:this.canvasHeigth/2}

  public prearleft!: point
  public prearright!: point 
  public pfrontleft!: point 
  public pfrontright!: point 

  public curInputAngle:number 
  public curInputPosition:number 

  public positionsPerSide:number = 4

  public copiedHiddenLayerList:number[] = this.carAIService.copiedAICarConstructionPlan.networkPlan.hiddenLayerSizes



  constructor(public carAIService:CarGameAgentServiceService){
    this.prearleft = {x: this.position.x - this.curCOS * this.pixelLength*0.5 + this.curSIN * this.pixelWidth*0.5, 
      y: this.position.y - this.curCOS * this.pixelWidth*0.5 - this.curSIN * this.pixelLength*0.5}
    this.prearright = {x: this.prearleft.x - this.curSIN * this.pixelWidth, y: this.prearleft.y + this.curCOS * this.pixelWidth}
    this.pfrontleft = {x: this.prearleft.x + this.curCOS * this.pixelLength, y: this.prearleft.y + this.curSIN * this.pixelLength}
    this.pfrontright = {x: this.prearright.x + this.curCOS * this.pixelLength, y: this.prearright.y + this.curSIN * this.pixelLength}
    this.curInputPosition = this.sensorPositiontoInt(this.copiedSensor.relPositionCarFrameCode)
    this.curInputAngle = this.toDeg(this.copiedSensor.relativeAngle)
  }


  ngAfterViewInit(): void {
    this.showSensorSettingCanvas.nativeElement.width = this.canvasWidth
    this.showSensorSettingCanvas.nativeElement.height = this.canvasHeigth
    this.sensorCtx = this.showSensorSettingCanvas.nativeElement.getContext("2d")
    this.drawCarWithSensors()
  }

  round(number:number, decimals:number){
    return Number((number).toFixed(decimals))
  }

  min(numbers:number[]){
    return Math.min(...numbers, Number.POSITIVE_INFINITY)
  }

  calculateFractionFitnessFactors(x:number){
    let summedFractions:number = (    
      this.carAIService.fitnessFunctionInfo.energyConsumptionFactor
      +this.carAIService.fitnessFunctionInfo.tractionControlFactor
      +this.carAIService.fitnessFunctionInfo.jerkFactor
      +this.carAIService.fitnessFunctionInfo.uncomfAccelerationFactor
      +this.carAIService.fitnessFunctionInfo.trackCompletionFactor
      +this.carAIService.fitnessFunctionInfo.trackpertime
      +this.carAIService.fitnessFunctionInfo.optimalFrictionFactor)
    return summedFractions > 0 ? this.round((x/summedFractions)*100, 1) : 0
  }

  compareModdedSensorsToAppliedSensors(){
    if(this.sensorList.length != this.carAIService.AIcars[0].distsensors.length){this.carAIService.sensorsModded = true; return;}
    let listsMatch:boolean = true
    this.sensorList.forEach((sensor:SensorConstructionPlan,idx:number) =>{
      if (sensor.relativeAngle != this.carAIService.AIcars[0].distsensors[idx].relativeangle ||
        this.sensorPositiontoInt(sensor.relPositionCarFrameCode) != 
        this.sensorPositiontoInt(this.carAIService.AIcars[0].distsensors[idx].rPCHC) 
      ){listsMatch = false}
    })
    this.carAIService.sensorsModded = !listsMatch
  } 

  deleteSelectedSensor(){
    this.sensorList.forEach((sensor,idx) =>{
      if (sensor.relativeAngle == this.selectedSensor.relativeAngle &&
        this.sensorPositiontoInt(sensor.relPositionCarFrameCode) == 
        this.sensorPositiontoInt(this.selectedSensor.relPositionCarFrameCode) 
      ){this.sensorList.splice(idx,1)}
    })
    this.selectedSensor = this.sensorList[0]
    this.compareModdedSensorsToAppliedSensors()
    this.onAnyNeuralNetworkChange()
    this.drawCarWithSensors()
  }

  overwriteSelectedSensor(){  
    this.sensorList.forEach((sensor,idx) =>{
      if (sensor.relativeAngle == this.selectedSensor.relativeAngle &&
        this.sensorPositiontoInt(sensor.relPositionCarFrameCode) == 
        this.sensorPositiontoInt(this.selectedSensor.relPositionCarFrameCode) 
      ){
        sensor.relativeAngle = this.copiedSensor.relativeAngle;
        [...sensor.relPositionCarFrameCode] = [...this.copiedSensor.relPositionCarFrameCode]
      }
    })
    this.compareModdedSensorsToAppliedSensors()
    this.onAnyNeuralNetworkChange()
    this.drawCarWithSensors()
  }

  onSensorSettingChange(){
    this.copiedSensor.relativeAngle = this.toRad(this.curInputAngle)
    this.copiedSensor.relPositionCarFrameCode = this.sensorPositiontoArray(this.curInputPosition)
    this.drawCarWithSensors()
  }

  copySensor(plan:SensorConstructionPlan):SensorConstructionPlan{
    return {relPositionCarFrameCode: [...plan.relPositionCarFrameCode], relativeAngle: plan.relativeAngle}
  }

  addSensor(){
    let alreadyInList:boolean = false
    this.sensorList.forEach((sensor) =>{
      if (sensor.relativeAngle == this.copiedSensor.relativeAngle &&
        this.sensorPositiontoInt(sensor.relPositionCarFrameCode) == 
        this.sensorPositiontoInt(this.copiedSensor.relPositionCarFrameCode) 
      ){alreadyInList = true}
    })
    if(!alreadyInList){
      this.sensorList.push(this.copySensor(this.copiedSensor));
      this.compareModdedSensorsToAppliedSensors(); 
      this.onAnyNeuralNetworkChange()
      this.selectedSensor = this.sensorList[this.sensorList.length-1];
      this.drawCarWithSensors()
      console.log("Added new Sensor")
    }
    else{console.log("Sensor already in List")}
    
    this.drawCarWithSensors()
  }

  toDeg(rad:number){return Math.round(rad*180/Math.PI)}
  toRad(deg:number){return deg*Math.PI/180}

  sensorPositiontoInt(code:[number,number,number,number]):number{
    let sum:number = code.reduce((a,b) => a+b ,0)
    let weightedsum:number = code.reduce((a,b,idx) => a+b*idx ,0)
    if(code[0] > 0 && code[3] > 0){weightedsum += code[0]*4}
    return Math.round(weightedsum/sum * this.positionsPerSide)
  }

  sensorPositiontoArray(x:number):[number,number,number,number]{
    let code:[number,number,number,number] = [0,0,0,0]
    let positionOnSide:number = x % this.positionsPerSide
    let firstidx:number = Math.floor(x/this.positionsPerSide)
    let secondidx:number = Math.ceil(x/this.positionsPerSide)%this.positionsPerSide
    if(positionOnSide == 0){code[Math.round(x/this.positionsPerSide)] = 1}
    else if(positionOnSide == 1){code[firstidx] = 3; code[secondidx] = 1}
    else if(positionOnSide == 2){code[firstidx] = 1; code[secondidx] = 1}
    else if(positionOnSide == 3){code[firstidx] = 1; code[secondidx] = 3}
    return code
  }

  changeHiddenLayerNeuronNumber(idx:number, event:any){
    this.copiedHiddenLayerList[idx] = event.value
    this.onAnyNeuralNetworkChange()
  }

  addHiddenLayer(){
    this.carAIService.copiedAICarConstructionPlan.networkPlan.hiddenLayerSizes.push(10)
    this.onAnyNeuralNetworkChange()
  }

  removeHiddenLayer(){
    this.carAIService.copiedAICarConstructionPlan.networkPlan.hiddenLayerSizes.pop()
    this.onAnyNeuralNetworkChange()
  }

  onAnyNeuralNetworkChange(){
    this.updateCopiedInputsOutputsofAINetwork()
    this.neuralNetworkSettingUpdateCheck()
  }

  updateCopiedInputsOutputsofAINetwork(){
    this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs = 0
    this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs +=  this.carAIService.copiedAICarConstructionPlan.giveSensors ? this.carAIService.copiedAICarConstructionPlan.distSensors.length : 0
    this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs +=  this.carAIService.copiedAICarConstructionPlan.givePosition ? 1 : 0
    this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs +=  this.carAIService.copiedAICarConstructionPlan.giveVelocity ? 1 : 0
    this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs +=  this.carAIService.copiedAICarConstructionPlan.giveAcceleration ? 1 : 0
    this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs +=  this.carAIService.copiedAICarConstructionPlan.giveZentripetalAcceleration ? 1 : 0

    this.carAIService.copiedAICarConstructionPlan.networkPlan.outputs = this.carAIService.copiedAICarConstructionPlan.mergeThrottleandBreak ? 2 : 3
  }

  neuralNetworkSettingUpdateCheck(){
    this.carAIService.neuralNetworkModded =  !(
      this.carAIService.copiedAICarConstructionPlan.networkPlan.activationFunctionId == this.carAIService.aICarConstructionPlan.networkPlan.activationFunctionId &&
      this.carAIService.copiedAICarConstructionPlan.networkPlan.inputs == this.carAIService.aICarConstructionPlan.networkPlan.inputs &&
      this.carAIService.copiedAICarConstructionPlan.networkPlan.outputs == this.carAIService.aICarConstructionPlan.networkPlan.outputs &&
      this.arraysAreEqual(this.carAIService.copiedAICarConstructionPlan.networkPlan.hiddenLayerSizes, this.carAIService.aICarConstructionPlan.networkPlan.hiddenLayerSizes) &&
      this.carAIService.copiedAICarConstructionPlan.giveSensors == this.carAIService.aICarConstructionPlan.giveSensors &&
      this.carAIService.copiedAICarConstructionPlan.givePosition == this.carAIService.aICarConstructionPlan.givePosition &&
      this.carAIService.copiedAICarConstructionPlan.giveVelocity == this.carAIService.aICarConstructionPlan.giveVelocity &&
      this.carAIService.copiedAICarConstructionPlan.giveAcceleration == this.carAIService.aICarConstructionPlan.giveAcceleration &&
      this.carAIService.copiedAICarConstructionPlan.giveZentripetalAcceleration == this.carAIService.aICarConstructionPlan.giveZentripetalAcceleration &&
      this.carAIService.copiedAICarConstructionPlan.mergeThrottleandBreak == this.carAIService.aICarConstructionPlan.mergeThrottleandBreak 
    )
  }

  arraysAreEqual(a:any[], b:any[]):boolean{
    if(a.length != b.length){return false}
    let areEqual:boolean = true
    a.forEach((x:any,idx:number) => {
      if(x != b[idx]){areEqual = false}
    })
    return areEqual
  }

  drawCarWithSensors(){
    this.clearCanvas()
    this.drawCar(this.prearleft.x, this.prearleft.y, this.pixelLength, this.pixelWidth)
    this.drawSensor(this.copiedSensor, "rgb(157, 238, 35)", 12)
    

    for(let i:number = 0; i < this.sensorList.length; i++){
      let sensor:SensorConstructionPlan = this.sensorList[i]
      if (sensor.relativeAngle == this.selectedSensor.relativeAngle &&
        this.sensorPositiontoInt(sensor.relPositionCarFrameCode) == 
        this.sensorPositiontoInt(this.selectedSensor.relPositionCarFrameCode) 
      ){this.drawSensor(sensor, "rgb(190, 0, 0)",8)}
      else{this.drawSensor(sensor,"grey",8)}
    }  

    
  }

  drawCar(x:number, y:number, width:number, height:number, angle:number = 0, color:string = "#3f51b5"){
    this.sensorCtx.translate(x, y)
    this.sensorCtx.rotate(angle)
    this.sensorCtx.fillStyle = color
    this.sensorCtx.fillRect(0, 0, width, height)
    this.sensorCtx.fillStyle = "white"
    this.sensorCtx.font = '60px serif';
    this.sensorCtx.fillText('→', 5, this.pixelWidth-2);

    let lightWidth:number = width/18
    let lighthheight:number = height/5
    this.sensorCtx.fillStyle = "rgb(150,0,0)"
    this.sensorCtx.fillRect(0,2,lightWidth,lighthheight)
    this.sensorCtx.fillRect(0,height - lighthheight - 2,lightWidth,lighthheight)

    this.sensorCtx.fillStyle = "rgb(255, 208, 0)"
    this.sensorCtx.fillRect(width-lightWidth,2,lightWidth,lighthheight)
    this.sensorCtx.fillRect(width-lightWidth,height - lighthheight - 2,lightWidth,lighthheight)

    this.sensorCtx.rotate(-angle)
    this.sensorCtx.translate(-x, -y)
    this.sensorCtx.fillStyle = "black"
  }

  drawSensor(sensorPlan:SensorConstructionPlan, color:string = "black", arrowHeadSize = 10){
    let absoluteangle:number = this.angle + sensorPlan.relativeAngle
    let rPCHC = sensorPlan.relPositionCarFrameCode
    let measurableDistance = 50
    this.curCOS = Math.cos(absoluteangle)
    this.curSIN = Math.sin(absoluteangle)

    let p1:point = {
      x:(this.prearleft.x*rPCHC[0] + this.pfrontleft.x*rPCHC[1] + this.pfrontright.x*rPCHC[2] 
        + this.prearright.x*rPCHC[3])/(rPCHC[0]+rPCHC[1]+rPCHC[2]+rPCHC[3]),
      y: (this.prearleft.y*rPCHC[0] + this.pfrontleft.y*rPCHC[1] + this.pfrontright.y*rPCHC[2] 
        + this.prearright.y*rPCHC[3])/(rPCHC[0]+rPCHC[1]+rPCHC[2]+rPCHC[3])
      } 

    let edge:edge = {p1,p2:{x:this.curCOS*measurableDistance+p1.x, y:this.curSIN*measurableDistance+p1.y}}

    this.drawCircle(edge.p1,3,true,color)
    this.drawEdge(edge, color)
    this.drawArrowHead(edge.p1.x,edge.p1.y,edge.p2.x,edge.p2.y,arrowHeadSize,color)  
  }

  drawArrowHead(fromx:number, fromy:number, tox:number, toy:number, r:number, color:string = "#3f51b5"){
    let context:CanvasRenderingContext2D = this.sensorCtx
    let x_center = tox;
    let y_center = toy;
    let angle;
    let x;
    let y;
    context.beginPath();
    angle = Math.atan2(toy-fromy,tox-fromx)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;
    context.moveTo(x, y);
    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;
    context.lineTo(x, y);
    angle += (1/3)*(2*Math.PI)
    x = r*Math.cos(angle) + x_center;
    y = r*Math.sin(angle) + y_center;
    context.lineTo(x, y);
    context.closePath();
    context.fillStyle = color
    context.fill();
  }

  clearCanvas(){
    this.sensorCtx.clearRect(0,0,this.sensorCtx.canvas.width, this.sensorCtx.canvas.height)
  }

  drawRectangle(x:number, y:number, width:number, height:number, angle:number = 0, color:string = "#3f51b5"){
    this.sensorCtx.translate(x, y)
    this.sensorCtx.rotate(angle)
    this.sensorCtx.fillStyle = color
    this.sensorCtx.fillRect(0, 0, width, height)
    this.sensorCtx.rotate(-angle)
    this.sensorCtx.translate(-x, -y)
    this.sensorCtx.fillStyle = "black"
  }

  drawEdge(edge:edge, color:string = "black"){
    this.sensorCtx.beginPath();
    this.sensorCtx.moveTo(edge.p1.x, edge.p1.y);
    this.sensorCtx.lineTo(edge.p2.x, edge.p2.y);
    this.sensorCtx.strokeStyle = color
    this.sensorCtx.stroke();
    this.sensorCtx.strokeStyle = "black"
  }

  drawCircle(p:point, radius:number = 5, fill:boolean = false, color: string = "black"){
    this.sensorCtx.beginPath();
    this.sensorCtx.arc(p.x, p.y, radius, 0, Math.PI*2);
    this.sensorCtx.strokeStyle = color
    this.sensorCtx.fillStyle = color
    this.sensorCtx.stroke();
    if(fill){this.sensorCtx.fill()}
    this.sensorCtx.strokeStyle = "black"
    this.sensorCtx.fillStyle = "black"
  }







}
