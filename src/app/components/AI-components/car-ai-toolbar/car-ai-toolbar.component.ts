import { Component, OnInit } from '@angular/core';
import { CarGameAgentServiceService } from '../../../services/AI/car-game-agent-service.service';


@Component({
  selector: 'app-car-ai-toolbar',
  templateUrl: './car-ai-toolbar.component.html',
  styleUrls: ['./car-ai-toolbar.component.css']
})
export class CarAiToolbarComponent implements OnInit {

  constructor(public carAIService:CarGameAgentServiceService) { }

  ngOnInit(): void {

  }

  round(number:number, decimals:number){
    return Number((number).toFixed(decimals))
  }

  min(numbers:number[]){
    return Math.min(...numbers, Number.POSITIVE_INFINITY)
  }
  
}
