import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolbarPathfindingComponent } from './toolbar-pathfinding.component';

describe('ToolbarPathfindingComponent', () => {
  let component: ToolbarPathfindingComponent;
  let fixture: ComponentFixture<ToolbarPathfindingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ToolbarPathfindingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolbarPathfindingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
