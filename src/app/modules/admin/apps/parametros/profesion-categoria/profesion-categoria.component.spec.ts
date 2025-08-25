import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfesionCategoriaComponent } from './profesion-categoria.component';

describe('ProfesionCategoriaComponent', () => {
  let component: ProfesionCategoriaComponent;
  let fixture: ComponentFixture<ProfesionCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfesionCategoriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProfesionCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
