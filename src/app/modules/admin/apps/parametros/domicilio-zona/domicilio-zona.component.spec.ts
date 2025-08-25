import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioZonaComponent } from './domicilio-zona.component';

describe('DomicilioZonaComponent', () => {
  let component: DomicilioZonaComponent;
  let fixture: ComponentFixture<DomicilioZonaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomicilioZonaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomicilioZonaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
