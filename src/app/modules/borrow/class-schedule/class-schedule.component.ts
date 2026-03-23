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
import { BORROWED_EQUIPMENT_PURPOSE, BorrowedEquipmentPayload } from '../../../models/BorrowedEquipment';
import { SnackbarService } from '../../../services/snackbar.service';
import { ISnackBarConfig } from '../../shared/snackbar/snackbar.component';
import { Department, DEPARTMENTS, IUser } from '../../../models/User';
import { UserService } from '../../../services/user.service';
import { IAutocompleteOption } from '../../shared/autocomplete/autocomplete.component';
import { getDisplayName } from '../../../utils/string.util';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { TokenData } from '../../../services/auth.service';
import { convertToAmericanFormat, get24HourTime } from '../../../utils/date.util';
import { CourseOfferingService } from '../../../services/course-offering.service';
import CourseOffering from '../../../models/CourseOffering';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.css',
  standalone: false,
})
export class ClassScheduleComponent implements OnInit {
  @Input() user!: TokenData;
  @Input() department!: Department | string;
  @Input() resetForm: boolean = false;
  @Output() onFormSubmit: EventEmitter<BorrowedEquipmentPayload> = new EventEmitter<BorrowedEquipmentPayload>();
  departments = DEPARTMENTS;
  classScheduleForm: FormGroup;
  initialSchedule: string;
  courseOffering: WritableSignal<CourseOffering[]> = signal([]);

  // facultyAutoCompleteOptions: IAutocompleteOption[] = []
  constructor(
    private fb: FormBuilder,
    private snackBarService: SnackbarService,
    private courseOfferingService: CourseOfferingService,
    private autocompleteService: AutocompleteService,
  ) {
    this.classScheduleForm = this.fb.group({
      borrower: ['', Validators.required],
      purpose: ['class_use', Validators.required],
      courseOffer: ['', Validators.required],
    });
    this.initialSchedule =
      convertToAmericanFormat(new Date()) + '-' + convertToAmericanFormat(new Date());
  }

  ngOnInit(): void {
    this.courseOfferingService.getCourseOfferings().subscribe({
      next: (resp) => this.courseOffering.set(resp),
    });
  }

  get courseOfferingAutoCompleteOptions() {
    return this.courseOffering().map((course) => ({
      view: course.course.title,
      value: course._id,
    }));
  }

  get purposeOptions() {
    return this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_PURPOSE);
  }

  get instructor() {
    let display: string = ''
    const courseOfferId = this.classScheduleForm.controls['courseOffer'].value;
    const found = this.courseOffering().find((c) => c._id == courseOfferId);
    if(found) display = getDisplayName(found.instructor)
    return display;
  }

  onSubmit() {
    this.classScheduleForm.controls['borrower'].patchValue(this.user._id);
    console.log('on submit', this.classScheduleForm.value);
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
