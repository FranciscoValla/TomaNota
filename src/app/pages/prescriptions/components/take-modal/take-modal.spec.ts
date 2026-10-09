import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TakeModal } from './take-modal';

describe('TakeModal', () => {
  let component: TakeModal;
  let fixture: ComponentFixture<TakeModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TakeModal],
    }).compileComponents();

    fixture = TestBed.createComponent(TakeModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
