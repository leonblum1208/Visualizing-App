import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingBarGraphComponent } from './sorting-bar-graph.component';

describe('SortingBarGraphComponent', () => {
  let component: SortingBarGraphComponent;
  let fixture: ComponentFixture<SortingBarGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortingBarGraphComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SortingBarGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
