import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabChangeEvent, MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-tab',
  imports: [MatTabsModule],
  templateUrl: './tab.component.html',
  styleUrl: './tab.component.css',
})
export class TabComponent {
  @Input() selected: number = 0;
  @Input() tabs: string[] = [];
  @Output() tabChange: EventEmitter<string> = new EventEmitter<string>();

  onTabChange(event: MatTabChangeEvent) {
    this.tabChange.emit(event.tab.textLabel);
  }
}
