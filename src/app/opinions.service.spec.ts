import { TestBed } from '@angular/core/testing';

import { OpinionsService } from './opinions.service';

describe('OpinionsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpinionsService = TestBed.get(OpinionsService);
    expect(service).toBeTruthy();
  });
});
