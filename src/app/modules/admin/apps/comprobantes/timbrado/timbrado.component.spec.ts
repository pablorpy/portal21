import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimbradoComponent } from './timbrado.component';

describe('TimbradoComponent', () => {
  let component: TimbradoComponent;
  let fixture: ComponentFixture<TimbradoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimbradoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TimbradoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
