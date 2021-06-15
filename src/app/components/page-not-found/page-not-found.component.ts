import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.css']
})
export class PageNotFoundComponent implements OnInit {

  public currentUrl:string = this.router.url.split("/").join(" / ")
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

}
