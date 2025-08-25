import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionEstadoComponent } from './profesion-estado.component';

describe('ProfesionEstadoComponent', () => {
  let component: ProfesionEstadoComponent;
  let fixture: ComponentFixture<ProfesionEstadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionEstadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfesionEstadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
