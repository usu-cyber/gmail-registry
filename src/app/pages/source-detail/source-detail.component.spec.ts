import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceDetail } from './source-detail.component';

describe('SourceDetail', () => {
  let component: SourceDetail;
  let fixture: ComponentFixture<SourceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
