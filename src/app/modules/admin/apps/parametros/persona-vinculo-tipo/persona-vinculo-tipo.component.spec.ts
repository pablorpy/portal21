import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaVinculoTipoComponent } from './persona-vinculo-tipo.component';

describe('PersonaVinculoTipoComponent', () => {
  let component: PersonaVinculoTipoComponent;
  let fixture: ComponentFixture<PersonaVinculoTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaVinculoTipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaVinculoTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
