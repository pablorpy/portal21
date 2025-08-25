import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionTipoPepComponent } from './profesion-tipo-pep.component';

describe('ProfesionTipoPepComponent', () => {
  let component: ProfesionTipoPepComponent;
  let fixture: ComponentFixture<ProfesionTipoPepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionTipoPepComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfesionTipoPepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
