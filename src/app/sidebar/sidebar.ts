// sidebar.component.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss']
})
export class SidebarComponent implements OnInit {
  collapsed = false;
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  userName = localStorage.getItem('username') ?? 'Usuario';
  userRole = localStorage.getItem('role')    ?? 'Estudiante';

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}