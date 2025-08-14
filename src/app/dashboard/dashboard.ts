import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';

interface KpiCard {
  label: string;
  value: number;
  delta: number;
  deltaType: string;
  icon: string;
}

interface SolicitudBeca {
  id: number;
  estudianteId: number;
  estudiante?: { nombre: string; apellido: string };
  tipoBecaId: number;
  tipoBeca?: { nombre: string };
  estadoId: number;
  estado?: { nombre: string };
  fechaSolicitud: string;
  periodoAcademicoId: number;
  periodoAcademico?: { nombre: string };
  observaciones: string | null;
  fechaResultado: string | null;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss']
})
export class DashboardComponent implements OnInit, AfterViewInit {
  kpis: KpiCard[] = [
    { label: 'Estudiantes Registrados', value: 0, delta: 0, deltaType: 'up', icon: '👥' },
    { label: 'Becas Disponibles', value: 0, delta: 0, deltaType: 'up', icon: '📚' },
    { label: 'Solicitudes Pendientes', value: 0, delta: 0, deltaType: 'down', icon: '⏳' },
    { label: 'Solicitudes Aprobadas', value: 0, delta: 0, deltaType: 'up', icon: '✅' }
  ];

  monthlyTrend: number[] = [];
  statusDistribution: number[] = [];
  pendingRequests: any[] = [];
  loading: boolean = false;
  error: string = '';

  private baseUrl = 'http://localhost:3000/api-beca/solicitudes-beca';
  private kpiBaseUrl = 'http://localhost:3000/api-beca';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.cargarDatosDashboard();
  }

  ngAfterViewInit(): void {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  async cargarDatosDashboard(): Promise<void> {
    this.loading = true;
    this.error = '';

    try {
      await Promise.all([
        this.cargarDatosKPIs(),
        this.cargarDatosGraficos(),
        this.cargarSolicitudesRecientes()
      ]);
      this.renderizarGraficos();
    } catch (error) {
      this.handleError('Error al cargar datos del dashboard', error);
    } finally {
      this.loading = false;
    }
  }

  async cargarDatosKPIs(): Promise<void> {
    try {
      const headers = this.getHeaders();
      const [estudiantes, becas, pendientes, aprobadas] = await Promise.all([
        this.http.get<{count: number}>(`${this.kpiBaseUrl}/estudiantes/count`, { headers }).toPromise().catch(() => ({count: 0})),
        this.http.get<{count: number}>(`${this.kpiBaseUrl}/tipo-beca/count`, { headers }).toPromise().catch(() => ({count: 0})),
        this.http.get<{count: number}>(`${this.baseUrl}/count?estadoId=1`, { headers }).toPromise().catch(() => ({count: 0})),
        this.http.get<{count: number}>(`${this.baseUrl}/count?estadoId=2`, { headers }).toPromise().catch(() => ({count: 0}))
      ]);
      this.actualizarKPIs(estudiantes?.count || 0, becas?.count || 0, pendientes?.count || 0, aprobadas?.count || 0);
    } catch (error) {
      this.handleError('Error al cargar KPIs', error);
    }
  }

  private actualizarKPIs(estudiantes: number, becas: number, pendientes: number, aprobadas: number): void {
    this.kpis[0].value = estudiantes;
    this.kpis[1].value = becas;
    this.kpis[2].value = pendientes;
    this.kpis[3].value = aprobadas;
  }

  async cargarDatosGraficos(): Promise<void> {
    try {
      const headers = this.getHeaders();
      const [tendencia, estados] = await Promise.all([
        this.http.get<{data: number[]}>(`${this.baseUrl}/tendencia?months=6`, { headers }).toPromise().catch(() => ({data: [0, 0, 0, 0, 0, 0]})),
        this.http.get<{data: number[]}>(`${this.baseUrl}/estadisticas/estados`, { headers }).toPromise().catch(() => ({data: [0, 0, 0, 0]}))
      ]);
      this.monthlyTrend = tendencia?.data || [0, 0, 0, 0, 0, 0];
      this.statusDistribution = estados?.data || [0, 0, 0, 0];
    } catch (error) {
      this.handleError('Error al cargar datos para gráficos', error);
    }
  }

  async cargarSolicitudesRecientes(): Promise<void> {
    try {
      const headers = this.getHeaders();
      const response = await this.http.get<SolicitudBeca[]>(`${this.baseUrl}/pendientes?limit=5`, { headers }).toPromise().catch(() => []);
      this.pendingRequests = (response || []).map(item => ({
        id: item.id,
        estudiante: (item.estudiante?.nombre ?? '') + ' ' + (item.estudiante?.apellido ?? '') || 'Desconocido',
        tipo: item.tipoBeca?.nombre || 'Sin tipo',
        fecha: item.fechaSolicitud 
          ? new Date(item.fechaSolicitud).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit'})
          : 'N/A'
      }));
    } catch (error) {
      this.handleError('Error al cargar solicitudes recientes', error);
    }
  }

  renderizarGraficos(): void {
    // Destruir gráficos existentes
    const trendChart = Chart.getChart('trendChart');
    if (trendChart) {
      trendChart.destroy();
    }
    
    const statusChart = Chart.getChart('statusChart');
    if (statusChart) {
      statusChart.destroy();
    }

    if (document.getElementById('trendChart')) {
      new Chart('trendChart', {
        type: 'line',
        data: {
          labels: this.obtenerUltimosMeses(6),
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
    }

    if (document.getElementById('statusChart')) {
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
  }

  private obtenerUltimosMeses(cantidad: number): string[] {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const fecha = new Date();
    const resultado: string[] = [];
    for (let i = cantidad - 1; i >= 0; i--) {
      const d = new Date(fecha.getFullYear(), fecha.getMonth() - i, 1);
      resultado.push(meses[d.getMonth()] + ' ' + d.getFullYear().toString().slice(2));
    }
    return resultado;
  }

  private handleError(contexto: string, error: any): void {
    console.error(`${contexto}:`, error);
    this.error = `${contexto}. ${error.message || 'Verifique su conexión'}`;
    if (error.status === 404) this.error += ' (Recurso no encontrado)';
    else if (error.status === 401) this.error += ' (No autorizado)';
  }

  navegarASolicitudes(): void {
    this.router.navigate(['/solicitud-beca']);
  }

  actualizarDashboard(): void {
    this.cargarDatosDashboard();
  }
}