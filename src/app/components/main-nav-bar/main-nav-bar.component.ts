import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-main-nav-bar',
  templateUrl: './main-nav-bar.component.html',
  styleUrls: ['./main-nav-bar.component.css']
})
export class MainNavBarComponent implements OnInit {

  public currentUrl:string = this.router.url.split("/").join(" / ")
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
