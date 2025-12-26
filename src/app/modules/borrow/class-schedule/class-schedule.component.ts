import {
  Component,
  computed,
  EventEmitter,
  OnInit,
  Output,
  Signal,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IDateRange } from '../../shared/datepicker/datepicker.component';
import { IBorrowingDetails } from '../../../models/BorrowedEquipment';
import { SnackbarService } from '../../../services/snackbar.service';
import { ISnackBarConfig } from '../../shared/snackbar/snackbar.component';
import { DEPARTMENTS, IUser } from '../../../models/User';
import { UserService } from '../../../services/user.service';
import { IAutocompleteOption } from '../../shared/autocomplete/autocomplete.component';
import { getDisplayName } from '../../../utils/string.util';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.css',
  standalone: false,
})
export class ClassScheduleComponent implements OnInit {
  departments = DEPARTMENTS;
  classScheduleForm: FormGroup;
  faculty: WritableSignal<IUser[]> = signal([]);
  @Output() onFormSubmit: EventEmitter<IBorrowingDetails> = new EventEmitter<IBorrowingDetails>();

  // facultyAutoCompleteOptions: IAutocompleteOption[] = []
  constructor(
    private fb: FormBuilder,
    private snackBarService: SnackbarService,
    private userService: UserService
  ) {
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

  ngOnInit(): void {
    this.userService.getUsers().subscribe({
      next: (resp) => {
        this.faculty.set(resp);
      },
    });
  }

  get facultyAutoCompleteOptions() {
    return this.faculty().map((user) => ({ view: getDisplayName(user), value: user._id }));
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
