import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDateRange } from '../../shared/datepicker/datepicker.component';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.css',
  standalone: false,
})
export class ClassScheduleComponent {
  classScheduleForm: FormGroup;

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
    console.log(this.classScheduleForm.invalid);
    console.log(this.classScheduleForm.value);
  }
}
