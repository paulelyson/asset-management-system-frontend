import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../services/side-menu.service';
import { ClassScheduleComponent } from '../../borrow/class-schedule/class-schedule.component';
import { BorrowModule } from '../../borrow/borrow-module';

@Component({
  selector: 'app-side-menu',
  imports: [BorrowModule],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  opened: boolean = false;
  template: string = ''
  constructor(private sideMenuService: SideMenuService) {}

  ngOnInit(): void {
    this.sideMenuService.onOpenSideMenu().subscribe((resp) => {
      this.opened = resp.opened;
      this.template = resp.template;
    });
  }
}
