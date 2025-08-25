import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioEstadoComponent } from './domicilio-estado.component';

describe('DomicilioEstadoComponent', () => {
  let component: DomicilioEstadoComponent;
  let fixture: ComponentFixture<DomicilioEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomicilioEstadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomicilioEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
