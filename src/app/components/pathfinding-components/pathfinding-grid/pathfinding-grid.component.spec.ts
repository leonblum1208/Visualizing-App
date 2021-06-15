import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathfindingGridComponent } from './pathfinding-grid.component';

describe('PathfindingGridComponent', () => {
  let component: PathfindingGridComponent;
  let fixture: ComponentFixture<PathfindingGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathfindingGridComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathfindingGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
