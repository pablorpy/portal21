import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SexoComponent } from './sexo.component';

describe('SexoComponent', () => {
  let component: SexoComponent;
  let fixture: ComponentFixture<SexoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SexoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SexoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
