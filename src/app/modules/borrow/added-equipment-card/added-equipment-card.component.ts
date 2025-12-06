import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IconComponent } from '../../shared/icon/icon.component';
import { IEquipment } from '../../../models/Equipment';

export interface IAddedEquipment extends IEquipment {
  borrowedCount: number;
}
type CardSize = 'sm' | 'md' | 'lg';
type CardType = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
type CardShade = 'default' | 'light';

@Component({
  selector: 'app-added-equipment-card',
  templateUrl: './added-equipment-card.component.html',
  styleUrl: './added-equipment-card.component.css',
  standalone: false,
})
export class AddedEquipmentCardComponent {
  @Input() equipment!: IAddedEquipment;
  @Input() size: CardSize = 'md';
  @Input() type: CardType = 'primary';
  @Input() shade: CardShade = 'default';
  @Input() title: string = '';
  @Input() descriptions: string[] = [];
  @Input() icon: string = 'calendar_today';
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

}
