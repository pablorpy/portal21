import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaContribuyenteComponent } from './persona-contribuyente.component';

describe('PersonaContribuyenteComponent', () => {
  let component: PersonaContribuyenteComponent;
  let fixture: ComponentFixture<PersonaContribuyenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaContribuyenteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaContribuyenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
