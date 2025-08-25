import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionEstadoPepComponent } from './profesion-estado-pep.component';

describe('ProfesionEstadoPepComponent', () => {
  let component: ProfesionEstadoPepComponent;
  let fixture: ComponentFixture<ProfesionEstadoPepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionEstadoPepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfesionEstadoPepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
