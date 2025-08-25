import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioTipoComponent } from './domicilio-tipo.component';

describe('DomicilioTipoComponent', () => {
  let component: DomicilioTipoComponent;
  let fixture: ComponentFixture<DomicilioTipoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomicilioTipoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomicilioTipoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
