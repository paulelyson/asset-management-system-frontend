import { Component, OnInit } from '@angular/core';
import { SideMenuService } from '../../../services/side-menu.service';

@Component({
  selector: 'app-side-menu',
  imports: [],
  templateUrl: './side-menu.component.html',
  styleUrl: './side-menu.component.css',
})
export class SideMenuComponent implements OnInit {
  opened: boolean = false;

  constructor(private sideMenuService: SideMenuService) {}

  ngOnInit(): void {
    this.sideMenuService.onOpenSideMenu().subscribe((resp: boolean) => {
      this.opened = resp;
    });
  }
}
