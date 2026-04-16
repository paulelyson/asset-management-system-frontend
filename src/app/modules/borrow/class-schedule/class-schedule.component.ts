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
import {
  BORROWED_EQUIPMENT_PURPOSE,
  BorrowedEquipmentPayload,
} from '../../../models/BorrowedEquipment';
import { SnackbarService } from '../../../services/snackbar.service';
import { ISnackBarConfig } from '../../shared/snackbar/snackbar.component';
import { Department, DEPARTMENTS, IUser } from '../../../models/User';
import { UserService } from '../../../services/user.service';
import { IAutocompleteOption } from '../../shared/autocomplete/autocomplete.component';
import { getDisplayName } from '../../../utils/string.util';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { TokenData } from '../../../services/auth.service';
import {
  concatDateAndTime,
  convertToAmericanFormat,
  get24HourTime,
} from '../../../utils/date.util';
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
  @Output() onFormSubmit: EventEmitter<BorrowedEquipmentPayload> =
    new EventEmitter<BorrowedEquipmentPayload>();
  departments = DEPARTMENTS;
  classScheduleForm: FormGroup;
  courseOffering: WritableSignal<CourseOffering[]> = signal([]);
  dateNow = new Date();

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
      startDate: [this.dateNow, Validators.required],
      endDate: [this.dateNow, Validators.required],
      startTime: [get24HourTime(this.dateNow.toISOString(), true), Validators.required],
      endTime: [get24HourTime(this.dateNow.toISOString(), true, 1), Validators.required],
    });
  }

  ngOnInit(): void {
    this.courseOfferingService.getCourseOfferings().subscribe({
      next: (resp) => this.courseOffering.set(resp),
    });
  }

  get courseOffer() {
    const courseOfferId = this.classScheduleForm.controls['courseOffer'].value;
    return this.courseOffering().find((offer) => offer._id === courseOfferId);
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

  onSubmit() {
    this.classScheduleForm.controls['borrower'].patchValue(this.user._id);
    const startDate: Date = this.classScheduleForm.controls['startDate'].value;
    const startTime: string = this.classScheduleForm.controls['startTime'].value;
    const endDate: Date = this.classScheduleForm.controls['endDate'].value;
    const endTime: string = this.classScheduleForm.controls['endTime'].value;
    const payload: BorrowedEquipmentPayload = {
      borrower: this.classScheduleForm.controls['borrower'].value,
      purpose: this.classScheduleForm.controls['purpose'].value,
      courseOffering: this.classScheduleForm.controls['courseOffer'].value,
      dateOfUse: {
        start: concatDateAndTime(startDate, startTime),
        end: concatDateAndTime(endDate, endTime),
      },
      borrowedEquipment: [],
    };
    console.log('on submit', payload);
    if (this.classScheduleForm.invalid) {
      const config: ISnackBarConfig = {
        type: 'error',
        message: ['Please fill out all details.'],
        icon: '',
      };
      this.snackBarService.openSnackbar(config);
    } else {
      this.onFormSubmit.emit(payload);
      // TO DO
      // display snackbar error
    }
  }
}
