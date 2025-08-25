import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonaTipoDocumentoComponent } from './persona-tipo-documento.component';

describe('PersonaTipoDocumentoComponent', () => {
  let component: PersonaTipoDocumentoComponent;
  let fixture: ComponentFixture<PersonaTipoDocumentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonaTipoDocumentoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PersonaTipoDocumentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
