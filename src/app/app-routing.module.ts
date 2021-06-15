import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { TestComponent } from './components/test/test.component';
import { PathfindingGridComponent } from './components/pathfinding-components/pathfinding-grid/pathfinding-grid.component';
import { MainNavBarComponent } from './components/main-nav-bar/main-nav-bar.component';
import { PathfindingPageComponent } from './components/pathfinding-components/pathfinding-page/pathfinding-page.component';
import { AboutPageComponent } from './components/about-page/about-page.component';
import { ToolbarPathfindingComponent } from './components/pathfinding-components/toolbar-pathfinding/toolbar-pathfinding.component';
import { SortingPageComponent } from './components/sorting-components/sorting-page/sorting-page.component';
import { SortingToolbarComponent } from './components/sorting-components/sorting-toolbar/sorting-toolbar.component';
import { SortingBarGraphComponent } from './components/sorting-components/sorting-bar-graph/sorting-bar-graph.component';
import { CarAIPageComponent } from './components/AI-components/car-ai-page/car-ai-page.component';
import { CarAiToolbarComponent } from './components/AI-components/car-ai-toolbar/car-ai-toolbar.component';
import { CarAiCanvasComponent } from './components/AI-components/car-ai-canvas/car-ai-canvas.component';


const routes: Routes = [
  {path :  '', redirectTo:'/home', pathMatch : 'full'},
  {path : 'home', component: HomePageComponent},
  {path : 'pathfinding', component: PathfindingPageComponent},
  {path : 'sorting', component: SortingPageComponent},
  {path : 'car-ai', component: CarAIPageComponent},
  {path : 'about', component: AboutPageComponent},
  {path : '**', component : PageNotFoundComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

export const Components = [
  PathfindingPageComponent,
  HomePageComponent, 
  TestComponent,
  PageNotFoundComponent,
  PathfindingGridComponent,
  MainNavBarComponent,
  AboutPageComponent,
  ToolbarPathfindingComponent,
  SortingPageComponent,
  SortingToolbarComponent,
  SortingBarGraphComponent,
  CarAIPageComponent,
  CarAiToolbarComponent,
  CarAiCanvasComponent,
]
