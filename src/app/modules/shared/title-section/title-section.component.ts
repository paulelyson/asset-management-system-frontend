import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-title-section',
  imports: [],
  templateUrl: './title-section.component.html',
  styleUrl: './title-section.component.css',
})
export class TitleSectionComponent {
  @Input() showBottomBorder: boolean = true;
}
