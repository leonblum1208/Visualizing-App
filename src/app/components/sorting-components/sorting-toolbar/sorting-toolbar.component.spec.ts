import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SortingToolbarComponent } from './sorting-toolbar.component';

describe('SortingToolbarComponent', () => {
  let component: SortingToolbarComponent;
  let fixture: ComponentFixture<SortingToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SortingToolbarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SortingToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
