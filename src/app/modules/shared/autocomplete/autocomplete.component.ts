import { AsyncPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
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
import {
  FloatLabelType,
  MatFormFieldAppearance,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { map, Observable, startWith } from 'rxjs';

export interface IAutocompleteOption {
  value: string;
  view: string;
}

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
  @Input() options: IAutocompleteOption[] = [];
  @Input() floatLabel: FloatLabelType = 'always';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Input() placeholder: string = '';

  myControl = new FormControl('');
  filteredOptions!: Observable<IAutocompleteOption[]>;
  @Output() optionselected: EventEmitter<string> = new EventEmitter();

  // accessor
  value: string = '';
  disabled: boolean = false;
  public changed = (_: any) => {};
  public touched = () => {};

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || '')),
    );
  }

  writeValue(value: any): void {
    this.value = value;
    this.myControl.setValue(this.value ?? '', { emitEvent: true });
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

  onFocus() {
    this.myControl.setValue(this.myControl.value ?? '', { emitEvent: true });
  }

  displayFn(value: string): string {
    // TO DO
    // options is an AutoComplete options in this function but a query list
    // might chage the 'options' variable to something else
    return  this.options.find((opt) => opt.value == value)?.view ?? ''
  }

  private _filter(value: string): IAutocompleteOption[] {
    const filterValue = value.toLowerCase();
    return this.options.filter((option) => option.view.toLowerCase().includes(filterValue));
  }
}
