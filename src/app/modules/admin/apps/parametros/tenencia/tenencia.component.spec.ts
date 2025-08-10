import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TenenciaComponent } from './tenencia.component';

describe('TenenciaComponent', () => {
  let component: TenenciaComponent;
  let fixture: ComponentFixture<TenenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TenenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TenenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
