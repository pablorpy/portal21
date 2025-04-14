import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoCuentaBoxComponent } from './estado-cuenta-box.component';

describe('EstadoCuentaBoxComponent', () => {
  let component: EstadoCuentaBoxComponent;
  let fixture: ComponentFixture<EstadoCuentaBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoCuentaBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EstadoCuentaBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
