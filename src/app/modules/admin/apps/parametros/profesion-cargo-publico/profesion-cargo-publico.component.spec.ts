import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionCargoPublicoComponent } from './profesion-cargo-publico.component';

describe('ProfesionCargoPublicoComponent', () => {
  let component: ProfesionCargoPublicoComponent;
  let fixture: ComponentFixture<ProfesionCargoPublicoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionCargoPublicoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfesionCargoPublicoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
