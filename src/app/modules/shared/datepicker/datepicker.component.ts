import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ControlValueAccessor,
  Form,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import {
  FloatLabelType,
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { americanDateToISODate } from '../../../utils/date.util';

@Component({
  selector: 'app-datepicker',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css',
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() label: string = 'Choose date';
  @Input() placeholder: string = '';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Input() floatLabel: FloatLabelType = 'always';
  @Input() type: 'datepicker' | 'daterange' = 'datepicker';
  @Output() dateChanged: EventEmitter<string> = new EventEmitter();

  // accessor
  value: string = '';
  disabled: boolean = false;
  public changed = (_: any) => {};
  public touched = () => {};

  // daterange
  daterangeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.daterangeForm = this.fb.group({
      start: [''],
      end: [''],
    });
  }

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    this.changed = fn;
  }
  registerOnTouched(fn: any): void {
    this.touched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.changed(this.value);
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.changed(this.daterangeForm.value);
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.changed(this.daterangeForm.value);
  }
}
