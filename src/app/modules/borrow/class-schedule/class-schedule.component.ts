import {
  Component,
  computed,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  Signal,
  signal,
  SimpleChanges,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDateRange } from '../../shared/datepicker/datepicker.component';
import { BORROWED_EQUIPMENT_PURPOSE, IBorrowingDetails } from '../../../models/BorrowedEquipment';
import { SnackbarService } from '../../../services/snackbar.service';
import { ISnackBarConfig } from '../../shared/snackbar/snackbar.component';
import { Department, DEPARTMENTS, IUser } from '../../../models/User';
import { UserService } from '../../../services/user.service';
import { IAutocompleteOption } from '../../shared/autocomplete/autocomplete.component';
import { getDisplayName } from '../../../utils/string.util';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { TokenData } from '../../../services/auth.service';
import { convertToAmericanFormat, get24HourTime } from '../../../utils/date.util';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.css',
  standalone: false,
})
export class ClassScheduleComponent implements OnInit, OnChanges {
  @Input() user!: TokenData;
  @Input() department!: Department | string;
  @Input() resetForm: boolean = false;
  @Output() onFormSubmit: EventEmitter<IBorrowingDetails> = new EventEmitter<IBorrowingDetails>();
  departments = DEPARTMENTS;
  classScheduleForm: FormGroup;
  initialSchedule: string;
  faculty: WritableSignal<IUser[]> = signal([]);

  // facultyAutoCompleteOptions: IAutocompleteOption[] = []
  constructor(
    private fb: FormBuilder,
    private snackBarService: SnackbarService,
    private userService: UserService,
    private autocompleteService: AutocompleteService
  ) {
    this.classScheduleForm = this.fb.group({
      borrower: ['', Validators.required],
      classDepartment: ['', Validators.required],
      faculty: ['', Validators.required],
      purpose: ['class_use', Validators.required],
      classCode: ['', Validators.required],
      className: ['', Validators.required],
      dateOfUseStart: ['', Validators.required],
      dateOfUseEnd: ['', Validators.required],
      timeOfUseStart: [get24HourTime(), Validators.required],
      timeOfUseEnd: [get24HourTime(undefined, true, 1), Validators.required],
    });
    this.initialSchedule =
      convertToAmericanFormat(new Date()) + '-' + convertToAmericanFormat(new Date());
  }

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (resp) => {
        this.faculty.set(resp);
      },
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['user']) {
      this.classScheduleForm.controls['borrower'].patchValue(this.user._id);
    }

    if (changes['department']) {
      this.classScheduleForm.controls['classDepartment'].patchValue(this.department);
    }

    if (changes['resetForm'] && this.resetForm == true) {
      this.classScheduleForm.reset();
    }
  }

  get facultyAutoCompleteOptions() {
    return this.faculty().map((user) => ({ view: getDisplayName(user), value: user._id }));
  }

  get purposeOptions() {
    return this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_PURPOSE);
  }

  onClassDateChanged(event: IDateRange) {
    this.classScheduleForm.controls['dateOfUseStart'].patchValue(event.start);
    this.classScheduleForm.controls['dateOfUseEnd'].patchValue(event.end);
  }

  onSubmit() {
    if (this.classScheduleForm.invalid) {
      const config: ISnackBarConfig = {
        type: 'error',
        message: ['Please fill out all details.'],
        icon: '',
      };
      this.snackBarService.openSnackbar(config);
    } else {
      this.onFormSubmit.emit(this.classScheduleForm.value);
      // TO DO
      // display snackbar error
    }
  }
}
