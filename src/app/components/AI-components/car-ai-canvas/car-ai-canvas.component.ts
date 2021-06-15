import { Component, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CarGameAgentServiceService } from '../../../services/AI/car-game-agent-service.service';
import { GAME_WIDTH, GAME_HEIGTH, PIXEL_PER_METER} from '../../../data/car-ai-tracks'



@Component({
  selector: 'app-car-ai-canvas',
  templateUrl: './car-ai-canvas.component.html',
  styleUrls: ['./car-ai-canvas.component.css']
})

export class CarAiCanvasComponent implements AfterViewInit {

  @ViewChild('carAIcanvas', {static: false}) carAIcanvas!: ElementRef;

  constructor(public carAIService:CarGameAgentServiceService) { }

  ngAfterViewInit(){
    this.carAIService.handOverCanvas(this.carAIcanvas)
    this.carAIService.createGame()
  }


  @HostListener('window:keydown', ['$event.keyCode'])
  keydownHandler(keyCode:number){
    if      (keyCode === 38 || keyCode === 87){this.carAIService.accelerate() }
    else if (keyCode === 40 || keyCode === 83){this.carAIService.brake() }
    else if (keyCode === 37 || keyCode === 65){this.carAIService.steerLeft() }
    else if (keyCode === 39 || keyCode === 68){this.carAIService.steerRight() };
  }  
  
  @HostListener('window:keyup', ['$event.keyCode'])
  keyupHandler(keyCode:number){
    if      (keyCode === 38 || keyCode === 87){this.carAIService.stopaccelerate() }
    else if (keyCode === 40 || keyCode === 83){this.carAIService.stopbrake() }
    else if (keyCode === 37 || keyCode === 65){this.carAIService.stopsteerLeft() }
    else if (keyCode === 39 || keyCode === 68){this.carAIService.stopsteerRight() };
  }


}
