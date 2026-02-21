import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SourceDetailComponent } from './source-detail.component';

describe('SourceDetailComponent', () => {
  let component: SourceDetailComponent;
  let fixture: ComponentFixture<SourceDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SourceDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SourceDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
