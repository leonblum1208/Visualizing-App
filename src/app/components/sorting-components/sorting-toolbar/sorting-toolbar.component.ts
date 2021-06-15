import { Component, OnInit } from '@angular/core';
import { SortingServiceService } from '../../../services/sorting/sorting-service.service';

@Component({
  selector: 'app-sorting-toolbar',
  templateUrl: './sorting-toolbar.component.html',
  styleUrls: ['./sorting-toolbar.component.css']
})
export class SortingToolbarComponent implements OnInit {

  constructor(public sortservice:SortingServiceService) { }

  ngOnInit(): void {
  }

}
