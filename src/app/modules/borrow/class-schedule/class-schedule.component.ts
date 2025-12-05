import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDateRange } from '../../shared/datepicker/datepicker.component';
import { IBorrowingDetails } from '../../../models/BorrowedEquipment';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.css',
  standalone: false,
})
export class ClassScheduleComponent {
  classScheduleForm: FormGroup;
  @Output() onFormSubmit: EventEmitter<IBorrowingDetails> = new EventEmitter<IBorrowingDetails>();

  constructor(private fb: FormBuilder) {
    this.classScheduleForm = this.fb.group({
      borrower: ['', Validators.required],
      classDepartment: ['', Validators.required],
      faculty: ['', Validators.required],
      purpose: ['', Validators.required],
      classCode: ['', Validators.required],
      className: ['', Validators.required],
      dateOfUseStart: ['', Validators.required],
      dateOfUseEnd: ['', Validators.required],
      timeOfUseStart: ['', Validators.required],
      timeOfUseEnd: ['', Validators.required],
    });
  }

  onClassDateChanged(event: IDateRange) {
    this.classScheduleForm.controls['dateOfUseStart'].patchValue(event.start);
    this.classScheduleForm.controls['dateOfUseEnd'].patchValue(event.end);
  }

  onSubmit() {
    if(this.classScheduleForm.invalid) {
      this.onFormSubmit.emit(this.classScheduleForm.value)
    } else {
      // TO DO
      // display snackbar error
    }
  }
}
