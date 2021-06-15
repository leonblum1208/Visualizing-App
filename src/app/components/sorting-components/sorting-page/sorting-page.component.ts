import { Component, OnInit } from '@angular/core';
import { SortingServiceService } from '../../../services/sorting/sorting-service.service';
import { SortingAlgorithmsService } from '../../../services/sorting/sorting-algorithms.service';

@Component({
  selector: 'app-sorting-page',
  templateUrl: './sorting-page.component.html',
  styleUrls: ['./sorting-page.component.css']
})
export class SortingPageComponent implements OnInit {

  constructor(public sortservice : SortingServiceService, public sortalgorithmservice : SortingAlgorithmsService) { }

  ngOnInit(): void {
    this.sortservice.updateState()
  }

}
