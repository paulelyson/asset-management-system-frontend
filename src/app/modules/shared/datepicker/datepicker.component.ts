import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ControlValueAccessor, FormsModule } from '@angular/forms';
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
  imports:  [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule,
  ],
  templateUrl: './datepicker.component.html',
  styleUrl: './datepicker.component.css',
})
export class DatepickerComponent implements ControlValueAccessor {
  @Input() label: string = 'Choose date';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Input() floatLabel: FloatLabelType = 'always';
  @Input() type: 'datepicker' | 'daterange' = 'datepicker';
  @Output() dateChanged: EventEmitter<string> = new EventEmitter();
  startDate: string = '';
  endDate: string = '';

  // accessor
  value: string = '';
  disabled: boolean = false;
  public changed = (_: any) => {};
  public touched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }
  registerOnChange(fn: any): void {
    const [startDate, endDate] = this.value.split('-'); // splitting eg 10/13/2025-10/14/2025
    [this.startDate, this.endDate] = [
      americanDateToISODate(startDate),
      americanDateToISODate(endDate),
    ]; // converted american to iso since datepicker accepts iso
    this.changed = fn;
  }
  registerOnTouched(fn: any): void {
    this.touched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onStartDateChange(event: MatDatepickerInputEvent<Date>): void {
    this.value = event.value?.toLocaleString().split(',')[0] ?? '';
    // this.changed(this.value);
  }

  onEndDateChange(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.value = this.value + '-' + (event.value?.toLocaleString().split(',')[0] ?? '');
      this.changed(this.value);
      // emitting datepicker as american format separated by '-' so it's easier to split the start and end
      this.dateChanged.emit(this.value);
    }
  }
}
