import { Component } from '@angular/core';
import { MatDividerModule } from '@angular/material/divider';
import { IconComponent } from '../icon/icon.component';
import { BadgeComponent } from '../badge/badge.component';

@Component({
  selector: 'app-equipment-detail-row',
  imports: [MatDividerModule, IconComponent, BadgeComponent],
  templateUrl: './equipment-detail-row.component.html',
  styleUrl: './equipment-detail-row.component.css',
})
export class EquipmentDetailRowComponent {

}
