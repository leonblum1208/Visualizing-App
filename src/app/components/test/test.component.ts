import { Component, OnInit } from '@angular/core';
import { ConfigService } from 'src/app/services/test/testservice.service';
import { IConfig } from './configInterface';

@Component({
  selector: 'app-test',
  template: `

  
  <p *ngIf = "config != undefined"> {{config.version}} </p>
  <p> {{ errorMsg }}</p>
  

  `,
  styles: [  ]
})
export class TestComponent implements OnInit {
  // properties
  public config!:IConfig;
  public errorMsg!:any;

  constructor(private ConfigServicePlaceholder : ConfigService) { }

  ngOnInit(): void {
    this.ConfigServicePlaceholder.getConfig()
    .subscribe(data => this.config = data,
                error => this.errorMsg = error);
  }
  
  showConfig() {
     
  }



}
