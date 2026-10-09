import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NextPresc } from './next-presc';

describe('NextPresc', () => {
  let component: NextPresc;
  let fixture: ComponentFixture<NextPresc>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NextPresc],
    }).compileComponents();

    fixture = TestBed.createComponent(NextPresc);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
