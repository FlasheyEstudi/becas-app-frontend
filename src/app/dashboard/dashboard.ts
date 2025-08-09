// src/app/dashboard/dashboard.component.ts
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  userRole: string = '';
  userName: string = '';

  // 🔢 KPIs
  kpis = [
    { label: 'Estudiantes Registrados', value: 0, delta: 0, deltaType: 'up', icon: '👥' },
    { label: 'Becas Disponibles', value: 0, delta: 0, deltaType: 'up', icon: '📚' },
    { label: 'Solicitudes Pendientes', value: 0, delta: 0, deltaType: 'down', icon: '⏳' },
    { label: 'Solicitudes Aprobadas', value: 0, delta: 0, deltaType: 'up', icon: '✅' }
  ];

  // 📈 Datos para gráficos
  monthlyTrend: number[] = [];
  statusDistribution: number[] = [];
  
  // 📋 Solicitudes pendientes
  pendingRequests: any[] = [];

  constructor(private router: Router) {
    this.loadUserInfo();
  }

  ngOnInit(): void {
    this.cargarDatosReales();
  }

  ngAfterViewInit(): void {
    // Los gráficos se renderizan después de cargar los datos
  }

  loadUserInfo() {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        this.userName = decoded.username || 'Usuario';
        this.userRole = decoded.role || 'Estudiante';
      } catch {
        this.userName = 'Usuario';
        this.userRole = 'Estudiante';
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  async cargarDatosReales() {
    try {
      // Cargar datos reales desde el backend
      await this.cargarKPIs();
      await this.cargarGraficos();
      await this.cargarSolicitudesPendientes();
      
      // Renderizar gráficos después de cargar los datos
      setTimeout(() => {
        this.renderCharts();
      }, 100);
      
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    }
  }

  async cargarKPIs() {
    // Simulación de llamadas reales al backend
    // Reemplazar con llamadas HTTP reales
    
    // Ejemplo de llamadas reales:
    // const estudiantesResponse = await fetch('http://localhost:3000/api-beca/estudiantes/count');
    // const becasResponse = await fetch('http://localhost:3000/api-beca/tipo-beca/count');
    // const solicitudesPendientesResponse = await fetch('http://localhost:3000/api-beca/solicitudes/pendientes/count');
    // const solicitudesAprobadasResponse = await fetch('http://localhost:3000/api-beca/solicitudes/aprobadas/count');
    
    // this.kpis[0].value = await estudiantesResponse.json().count;
    // this.kpis[1].value = await becasResponse.json().count;
    // this.kpis[2].value = await solicitudesPendientesResponse.json().count;
    // this.kpis[3].value = await solicitudesAprobadasResponse.json().count;
    
    // Datos simulados hasta implementar las llamadas reales
    this.kpis[0].value = 1247;
    this.kpis[0].delta = 52;
    
    this.kpis[1].value = 15;
    this.kpis[1].delta = 3;
    
    this.kpis[2].value = 89;
    this.kpis[2].delta = -12;
    
    this.kpis[3].value = 324;
    this.kpis[3].delta = 28;
  }

  async cargarGraficos() {
    // Simulación de llamadas reales al backend
    // Reemplazar con llamadas HTTP reales
    
    // Ejemplo de llamadas reales:
    // const tendenciaResponse = await fetch('http://localhost:3000/api-beca/solicitudes/tendencia');
    // const estadosResponse = await fetch('http://localhost:3000/api-beca/solicitudes/estados');
    
    // this.monthlyTrend = await tendenciaResponse.json().data;
    // this.statusDistribution = await estadosResponse.json().data;
    
    // Datos simulados hasta implementar las llamadas reales
    this.monthlyTrend = [280, 210, 250, 290, 300, 320];
    this.statusDistribution = [220, 110, 55, 45]; // Aprobadas, Pendientes, En revisión, Rechazadas
  }

  async cargarSolicitudesPendientes() {
    // Simulación de llamadas reales al backend
    // Reemplazar con llamadas HTTP reales
    
    // Ejemplo de llamada real:
    // const response = await fetch('http://localhost:3000/api-beca/solicitudes/pendientes?limit=5');
    // this.pendingRequests = await response.json();
    
    // Datos simulados hasta implementar las llamadas reales
    this.pendingRequests = [
      { estudiante: 'María González', tipo: 'Académica', fecha: '09/08' },
      { estudiante: 'Carlos López', tipo: 'Deportiva', fecha: '08/08' },
      { estudiante: 'Ana Martínez', tipo: 'Transporte', fecha: '07/08' },
      { estudiante: 'Luis Rodríguez', tipo: 'Académica', fecha: '06/08' },
      { estudiante: 'Sofía Pérez', tipo: 'Deportiva', fecha: '05/08' }
    ];
  }

  renderCharts() {
    // Limpiar gráficos existentes si ya existen
    const existingTrendChart = Chart.getChart('trendChart');
    const existingStatusChart = Chart.getChart('statusChart');
    
    if (existingTrendChart) {
      existingTrendChart.destroy();
    }
    
    if (existingStatusChart) {
      existingStatusChart.destroy();
    }

    // Tendencia mensual
    new Chart('trendChart', {
      type: 'line',
      data: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
        datasets: [{
          label: 'Solicitudes',
          data: this.monthlyTrend,
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });

    // Distribución de estados
    new Chart('statusChart', {
      type: 'doughnut',
      data: {
        labels: ['Aprobadas', 'Pendientes', 'En revisión', 'Rechazadas'],
        datasets: [{
          data: this.statusDistribution,
          backgroundColor: ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } }
      }
    });
  }

  goTo(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}