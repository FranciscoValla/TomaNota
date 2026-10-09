import { TestBed } from '@angular/core/testing';
import { ImgCompress } from './img-compress';

describe('ImgCompress', () => {
  let service: ImgCompress;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ImgCompress);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
