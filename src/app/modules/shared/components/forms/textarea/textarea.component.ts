import { CommonModule } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-textarea',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './textarea.component.html',
  styleUrl: './textarea.component.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextareaComponent),
      multi: true,
    },
  ],
})
export class TextareaComponent {
  @Input() label: string = 'Remarks';
  @Input() placeholder: string = 'Add note..';
  @Input() tag: string = '(Optional)';

  // accessor
  @Input() value: string = '';
  @Input() disabled: boolean = false;
  @Input() readonly: boolean = false;

  public changed = (_: any) => {};
  public touched = () => {};

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

  onInput(event: Event) {
    this.changed(this.value);
  }
}
