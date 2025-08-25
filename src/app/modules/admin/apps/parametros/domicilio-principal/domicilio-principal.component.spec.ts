import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DomicilioPrincipalComponent } from './domicilio-principal.component';

describe('DomicilioPrincipalComponent', () => {
  let component: DomicilioPrincipalComponent;
  let fixture: ComponentFixture<DomicilioPrincipalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DomicilioPrincipalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DomicilioPrincipalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
