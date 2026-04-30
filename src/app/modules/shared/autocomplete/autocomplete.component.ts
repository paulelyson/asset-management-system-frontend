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
  ViewChild,
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
  MatAutocompleteTrigger,
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
export class AutocompleteComponent implements ControlValueAccessor, OnChanges {
  @Input() label: string = '';
  @Input() options: IAutocompleteOption[] = [];
  @Input() floatLabel: FloatLabelType = 'always';
  @Input() appearance: MatFormFieldAppearance = 'fill';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;


  myControl = new FormControl<IAutocompleteOption | string | null>(null);
  filteredOptions!: Observable<IAutocompleteOption[]>;
  private pendingValue: any = null; // store raw value if options not ready yet
  @Output() optionselected: EventEmitter<string> = new EventEmitter();

  // accessor
  value: string = '';
  disabled: boolean = false;
  public changed = (_: any) => {};
  public touched = () => {};

  constructor() {
    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(this.myControl.value),
      map((value: string | IAutocompleteOption | null) => {
        const val = typeof value === 'string' ? value : (value?.view ?? '');
        return this._filter(val);
      }),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['options'] && this.pendingValue !== null) {
      // options just arrived, now we can match
      this._setValueFromRaw(this.pendingValue);
    }
  }

  writeValue(value: any): void {
    this.value = value;
    if (this.options.length) {
      this._setValueFromRaw(value);
    } else {
      // options not loaded yet, hold the value
      this.pendingValue = value;
      this.myControl.setValue(null, { emitEvent: false });
    }
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
    const selected = event.option.value;
    this.changed(selected.value);
    this.optionselected.emit(selected.value as string);
  }

  onInput(event: Event) {
    const input = (event.target as HTMLInputElement).value;
    if (!input) {
      this.changed(null); // clear the form control value if input is empty
    }
  }

  onFocus() {
    if (!this.myControl.value) {
      this.myControl.setValue('')
    }
  }

  displayFn = (option?: IAutocompleteOption): string => {
    return option?.view ?? '';
  };

  private _filter(value?: string): IAutocompleteOption[] {
    const filterValue = value?.toLowerCase() ?? '';
    return this.options.filter((option) => option.view.toLowerCase().includes(filterValue));
  }

  private _setValueFromRaw(raw: any): void {
    const matched = this.options.find((opt) => opt.value === raw);
    this.myControl.setValue(matched ?? null, { emitEvent: false });
    this.pendingValue = null;
  }
}
