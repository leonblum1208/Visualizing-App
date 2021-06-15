import { Component, OnInit } from '@angular/core';
import { SortingServiceService } from '../../../services/sorting/sorting-service.service';

@Component({
  selector: 'app-sorting-bar-graph',
  templateUrl: './sorting-bar-graph.component.html',
  styleUrls: ['./sorting-bar-graph.component.css']
})
export class SortingBarGraphComponent implements OnInit {

  constructor(public sortservice:SortingServiceService) { }

  ngOnInit(): void {
  }

}
