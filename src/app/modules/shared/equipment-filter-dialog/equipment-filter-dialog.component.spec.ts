import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EquipmentFilterDialogComponent } from './equipment-filter-dialog.component';

describe('EquipmentFilterDialogComponent', () => {
  let component: EquipmentFilterDialogComponent;
  let fixture: ComponentFixture<EquipmentFilterDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EquipmentFilterDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EquipmentFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
