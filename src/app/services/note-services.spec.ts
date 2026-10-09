import { TestBed } from '@angular/core/testing';
import { NoteServices } from './note-services';

describe('NoteServices', () => {
  let service: NoteServices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NoteServices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
