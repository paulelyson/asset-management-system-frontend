import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  signal,
  WritableSignal,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  BORROWED_EQUIPMENT_PURPOSE,
  BorrowedEquipmentPayload,
} from '../../../models/BorrowedEquipment';
import { Button, ISnackBarConfig, SnackbarService } from '@paulelyson/elyui';
import { Department, DEPARTMENTS } from '../../../models/User';
import { AutocompleteService } from '../../../services/autocomplete.service';
import { concatDateAndTime, get24HourTime } from '../../../utils/date.util';
import { CourseOfferingService } from '../../../services/course-offering.service';
import CourseOffering from '../../../models/CourseOffering';
import { DisplayNamePipe } from '../../../pipes/displayname.pipe';
import { AutocompleteComponent } from '../../shared/autocomplete/autocomplete.component';
import { CourseOfferDetailCardComponent } from '../../shared/course-offer-detail-card/course-offer-detail-card.component';
import { DatepickerComponent } from '../../shared/datepicker/datepicker.component';
import { InputComponent } from '../../shared/input/input.component';

@Component({
  selector: 'app-class-schedule',
  templateUrl: './class-schedule.component.html',
  styleUrl: './class-schedule.component.css',
  imports: [
    ReactiveFormsModule,
    AutocompleteComponent,
    CourseOfferDetailCardComponent,
    Button,
    DatepickerComponent,
    InputComponent,
  ],
})
export class ClassScheduleComponent implements OnInit {
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
    private displayNamePipe: DisplayNamePipe,
  ) {
    this.classScheduleForm = this.fb.group({
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
    return this.courseOffering().map((course) => {
      return {
        view: course.code + ' - ' + this.displayNamePipe.transform(course.course, 'code', 'title'),
        value: course._id,
      };
    });
  }

  get purposeOptions() {
    return this.autocompleteService.mapIntoAutocompleteOption(BORROWED_EQUIPMENT_PURPOSE);
  }

  onSubmit() {
    const startDate: Date = this.classScheduleForm.controls['startDate'].value;
    const startTime: string = this.classScheduleForm.controls['startTime'].value;
    const endDate: Date = this.classScheduleForm.controls['endDate'].value;
    const endTime: string = this.classScheduleForm.controls['endTime'].value;
    const payload: BorrowedEquipmentPayload = {
      purpose: this.classScheduleForm.controls['purpose'].value,
      courseOffering: this.classScheduleForm.controls['courseOffer'].value,
      dateOfUse: {
        start: concatDateAndTime(startDate, startTime),
        end: concatDateAndTime(endDate, endTime),
      },
      borrowedEquipment: [],
    };
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
