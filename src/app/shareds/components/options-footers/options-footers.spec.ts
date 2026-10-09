import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionsFooters } from './options-footers';

describe('OptionsFooters', () => {
  let component: OptionsFooters;
  let fixture: ComponentFixture<OptionsFooters>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsFooters],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsFooters);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
