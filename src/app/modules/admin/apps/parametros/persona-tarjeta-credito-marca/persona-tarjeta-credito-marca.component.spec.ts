import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaTarjetaCreditoMarcaComponent } from './persona-tarjeta-credito-marca.component';

describe('PersonaTarjetaCreditoMarcaComponent', () => {
  let component: PersonaTarjetaCreditoMarcaComponent;
  let fixture: ComponentFixture<PersonaTarjetaCreditoMarcaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaTarjetaCreditoMarcaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaTarjetaCreditoMarcaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
