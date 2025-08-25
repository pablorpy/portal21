import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioCategoriaComponent } from './domicilio-categoria.component';

describe('DomicilioCategoriaComponent', () => {
  let component: DomicilioCategoriaComponent;
  let fixture: ComponentFixture<DomicilioCategoriaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomicilioCategoriaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomicilioCategoriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
