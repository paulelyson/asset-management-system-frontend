import { Component, Input, OnInit } from '@angular/core';
import { SideMenuService } from '../../../services/side-menu.service';
import { ClassScheduleComponent } from '../../borrow/class-schedule/class-schedule.component';
import { BorrowModule } from '../../borrow/borrow-module';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'app-side-menu',
  imports: [BorrowModule, ButtonComponent],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  @Input() title: string = '';
  opened: boolean = false;
  template: string = ''
  data: any = null;
  constructor(private sideMenuService: SideMenuService) {}

  ngOnInit(): void {
    this.sideMenuService.onOpenSideMenu().subscribe((resp) => {
      this.opened = resp.opened;
      this.template = resp.template;
      this.data = resp.data;
    });
  }
}
