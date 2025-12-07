import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEquipment } from '../../../models/Equipment';
import { IconComponent } from '../icon/icon.component';
import { IAddedEquipment } from '../../borrow/added-equipment-card/added-equipment-card.component';

type CardSize = 'sm' | 'md' | 'lg';
type CardType = 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';
type CardShade = 'default' | 'light';


@Component({
  selector: 'app-equipment-card',
  imports: [CommonModule, MatIconModule, ButtonComponent, IconComponent],
  templateUrl: './equipment-card.component.html',
  styleUrl: './equipment-card.component.css',
})
export class EquipmentCardComponent {
  @Input() equipment!: IEquipment;
  @Input() size: CardSize = 'md';
  @Input() type: CardType = 'primary';
  @Input() shade: CardShade = 'default';
  @Input() title: string = '';
  @Input() descriptions: string[] = [];
  @Input() icon: string = 'calendar_today';
  @Output() addequipment: EventEmitter<IAddedEquipment> = new EventEmitter<IAddedEquipment>();
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

  onAddEquipment(): void {
    const addedEqmnt: IAddedEquipment = { ...this.equipment, borrowedQty: 4 };
    this.addequipment.emit(addedEqmnt);
  }

  get image() {
    const img = this.equipment.images[0]?.thumbnail;
    return img ? img : this.default_img;
  }
}
