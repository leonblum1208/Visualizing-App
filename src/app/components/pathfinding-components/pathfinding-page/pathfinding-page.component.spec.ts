import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PathfindingPageComponent } from './pathfinding-page.component';

describe('PathfindingPageComponent', () => {
  let component: PathfindingPageComponent;
  let fixture: ComponentFixture<PathfindingPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PathfindingPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PathfindingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
