import { Component, EventEmitter, forwardRef, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import {
  ControlValueAccessor,
  Form,
  FormBuilder,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import {
  FloatLabelType,
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { americanDateToISODate } from '../../../utils/date.util';

export interface IDateRange {
  start: string;
  end: string;
}

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
  providers: [provideNativeDateAdapter(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatepickerComponent),
      multi: true,
    },
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css',
})
export class DatepickerComponent implements ControlValueAccessor, OnChanges {
  @Input() label: string = 'Choose date';
  @Input() placeholder: string = '';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Input() floatLabel: FloatLabelType = 'always';
  @Input() type: 'datepicker' | 'daterange' = 'datepicker';
  @Input() initialDateRange: string = '';
  @Output() dateChanged: EventEmitter<string> = new EventEmitter<string>();
  @Output() dateRangeChanged: EventEmitter<IDateRange> = new EventEmitter<IDateRange>();

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialDateRange'] && this.initialDateRange) {
      const [startDate, endDate] = this.initialDateRange.split('-'); // splitting eg 10/13/2025-10/14/2025
      this.daterangeForm.controls['start'].setValue(americanDateToISODate(startDate));
      this.daterangeForm.controls['end'].setValue(americanDateToISODate(endDate));
      this.onStartDateChange()
      this.onEndDateChange()
    }
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
    this.dateChanged.emit(this.value);
  }

  onStartDateChange(): void {
    this.changed(this.daterangeForm.value);
    this.dateRangeChanged.emit(this.daterangeForm.value);
  }

  onEndDateChange(): void {
    this.changed(this.daterangeForm.value);
    this.dateRangeChanged.emit(this.daterangeForm.value);
  }
}
