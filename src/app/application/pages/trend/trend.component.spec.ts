import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendComponent } from './trend.component';

describe('TrendComponent', () => {
  let component: TrendComponent;
  let fixture: ComponentFixture<TrendComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TrendComponent]
    });
    fixture = TestBed.createComponent(TrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
