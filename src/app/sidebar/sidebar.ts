// src/app/sidebar/sidebar.ts
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  visible: boolean;
}

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
  userName = 'Usuario';
  userRole = 'estudiante';
  menuItems: MenuItem[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.updateUserData();
    this.buildMenu();

    // Escuchar cambios de ruta para actualizar sidebar
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
        this.updateUserData();
        this.buildMenu();
      }
    });
  }

  updateUserData() {
    this.userRole = localStorage.getItem('role')?.toLowerCase() || 'estudiante';
    this.userName = localStorage.getItem('username') || 'Usuario';
  }

  buildMenu() {
    this.menuItems = [
      { label: 'Dashboard', icon: '📊', route: '/dashboard', visible: true },

      // Menú Admin
      { label: 'Estudiantes', icon: '👥', route: '/estudiantes', visible: this.userRole === 'admin' },
      { label: 'Carreras', icon: '📚', route: '/carreras', visible: this.userRole === 'admin' },
      { label: 'Áreas', icon: '🧠', route: '/area-conocimiento', visible: this.userRole === 'admin' },
      { label: 'Requisitos', icon: '📋', route: '/requisitos', visible: this.userRole === 'admin' },
      { label: 'Tipos Beca', icon: '💰', route: '/tipo-beca', visible: this.userRole === 'admin' },
      { label: 'Períodos', icon: '📅', route: '/periodo-academico', visible: this.userRole === 'admin' },
      { label: 'Solicitudes', icon: '📝', route: '/solicitud-beca', visible: this.userRole === 'admin' },
      { label: 'Estados', icon: '🔄', route: '/estado', visible: this.userRole === 'admin' },
      { label: 'Reportes', icon: '📈', route: '/reportes', visible: this.userRole === 'admin' }, // Nueva línea
      { label: 'Configuración', icon: '⚙️', route: '/configuracion', visible: this.userRole === 'admin' },

      // Menú Estudiante
      { label: 'Perfil', icon: '👤', route: '/perfil', visible: this.userRole === 'estudiante' },
      { label: 'Becas Disponibles', icon: '🎓', route: '/becas-disponibles', visible: this.userRole === 'estudiante' },
      { label: 'Mis Solicitudes', icon: '📝', route: '/mis-solicitudes', visible: this.userRole === 'estudiante' }
    ].filter(item => item.visible);
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  isActive(route: string): boolean {
    return this.currentRoute === route;
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']).then(() => window.location.reload());
  }
}