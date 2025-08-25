import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoAporteComponent } from './estado-aporte.component';

describe('EstadoAporteComponent', () => {
  let component: EstadoAporteComponent;
  let fixture: ComponentFixture<EstadoAporteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoAporteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoAporteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
