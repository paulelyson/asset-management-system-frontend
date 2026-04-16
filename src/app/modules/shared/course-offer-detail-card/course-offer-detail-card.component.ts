import { Component, Input } from '@angular/core';
import CourseOffering from '../../../models/CourseOffering';
import { DisplayNamePipe } from '../../../pipes/displayname.pipe';

@Component({
  selector: 'app-course-offer-detail-card',
  imports: [DisplayNamePipe],
  templateUrl: './course-offer-detail-card.component.html',
  styleUrl: './course-offer-detail-card.component.css',
  standalone: true,
})
export class CourseOfferDetailCardComponent {
  @Input() courseOffer!: CourseOffering;
}
