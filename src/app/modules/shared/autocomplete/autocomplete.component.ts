import { AsyncPipe } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { FloatLabelType, MatFormFieldAppearance, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';

@Component({
  selector: 'app-autocomplete',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './autocomplete.component.html',
  styleUrl: './autocomplete.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AutocompleteComponent),
      multi: true,
    },
  ],
})
export class AutocompleteComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: string[] = [];
  @Input() floatLabel: FloatLabelType = 'always';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Input() placeholder: string = '';

  myControl = new FormControl('');
  filteredOptions: Observable<string[]>;
  @Output() optionselected: EventEmitter<string> = new EventEmitter();

  // accessor
  value: string = '';
  disabled: boolean = false;
  public changed = (_: any) => {};
  public touched = () => {};

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
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

  onOptionSelected(event: MatAutocompleteSelectedEvent): void {
    this.changed(this.myControl.value);
    this.optionselected.emit(this.myControl.value as string);
  }

  onInput(event: Event) {
    this.changed(this.myControl.value);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.options.filter((option) => option.toLowerCase().includes(filterValue));
  }
}
