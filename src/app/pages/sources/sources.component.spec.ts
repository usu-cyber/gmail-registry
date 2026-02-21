import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sources } from './sources.component';

describe('Sources', () => {
  let component: Sources;
  let fixture: ComponentFixture<Sources>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Sources]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sources);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
