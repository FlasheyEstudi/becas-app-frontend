import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar/sidebar'; // ✅ ruta correcta

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent],
  template: `
    <app-sidebar *ngIf="showSidebar"></app-sidebar>
    <main [class.with-sidebar]="showSidebar">
      <router-outlet></router-outlet>
    </main>
  `,
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'gestion-universitaria';
  showSidebar = false;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.updateSidebarVisibility();
      }
    });
    this.updateSidebarVisibility(); // primera carga
  }

  private updateSidebarVisibility() {
    const currentRoute = this.router.url;
    this.showSidebar = !!localStorage.getItem('token') &&
      !['/login', '/register'].includes(currentRoute);
  }
}