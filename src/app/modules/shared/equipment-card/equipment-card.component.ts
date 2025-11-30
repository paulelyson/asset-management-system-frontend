import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { IEquipment } from '../../../models/Equipment';
import { IconComponent } from '../icon/icon.component';

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
  @Output() addequipment: EventEmitter<IEquipment> = new EventEmitter<IEquipment>();
  default_img = 'https://placehold.co/60?text=No+Image&font=poppins';

  onAddEquipment(): void {
    this.addequipment.emit(this.equipment);
  }
}
