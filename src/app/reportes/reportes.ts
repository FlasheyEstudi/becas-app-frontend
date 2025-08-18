// src/app/reportes/reportes.component.ts
import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ReportStats {
  totalBeneficiarios: number;
  presupuestoTotal: number;
  solicitudesEstePeriodo: number;
  tasaAprobacion: number;
}

interface FinancialData {
  mes: string;
  presupuesto: number;
  ejecutado: number;
  pendiente: number;
}

interface ImpactData {
  carrera: string;
  beneficiarios: number;
  promedio: number;
  graduados: number;
  tasaRetencion: number;
}

interface StudentData {
  id: number;
  nombre: string;
  apellidos: string;
  carrera: string;
  becas: number;
  montoTotal: number;
}

interface StudentBeca {
  nombre: string;
  monto: number;
  fecha: string;
}

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reportes.html',
  styleUrls: ['./reportes.scss']
})
export class ReportesComponent implements OnInit {
  stats: ReportStats = {
    totalBeneficiarios: 0,
    presupuestoTotal: 0,
    solicitudesEstePeriodo: 0,
    tasaAprobacion: 0
  };

  financialData: FinancialData[] = [];
  impactData: ImpactData[] = [];
  students: StudentData[] = [];
  filteredStudents: StudentData[] = [];
  searchTerm: string = '';

  loading: boolean = false;
  error: string = '';
  activeTab: 'resumen' | 'financiero' | 'impacto' | 'estudiante' = 'estudiante';
  
  // Modal properties
  selectedStudent: StudentData | null = null;
  studentBecas: StudentBeca[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.loadReportData();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    });
  }

  private loadReportData() {
    this.loading = true;
    this.error = '';

    // Obtener métricas generales
    this.http.get<any>('http://localhost:3000/api-beca/reports/stats', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.stats = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar métricas:', err);
        this.error = 'Error al cargar métricas: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });

    // Obtener datos financieros
    this.http.get<FinancialData[]>('http://localhost:3000/api-beca/reports/financial', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.financialData = data;
      },
      error: (err) => {
        console.error('Error al cargar datos financieros:', err);
        this.error = 'Error al cargar datos financieros: ' + (err.error?.message || err.message);
      }
    });

    // Obtener datos de impacto
    this.http.get<ImpactData[]>('http://localhost:3000/api-beca/reports/impact', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.impactData = data;
      },
      error: (err) => {
        console.error('Error al cargar datos de impacto:', err);
        this.error = 'Error al cargar datos de impacto: ' + (err.error?.message || err.message);
      }
    });

    // Obtener datos de estudiantes
    this.http.get<StudentData[]>('http://localhost:3000/api-beca/reports/students', {
      headers: this.getHeaders()
    }).subscribe({
      next: (data) => {
        this.students = data;
        this.filteredStudents = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar datos de estudiantes:', err);
        this.error = 'Error al cargar datos de estudiantes: ' + (err.error?.message || err.message);
        this.loading = false;
      }
    });
  }

  changeTab(tab: 'resumen' | 'financiero' | 'impacto' | 'estudiante') {
    this.activeTab = tab;
  }

  exportReport() {
    alert('Exportando reporte...');
    // Lógica de exportación aquí
  }

  // Métodos para calcular posiciones de la línea (opcional)
  getLinePercentage(): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    return 100 / (this.financialData.length - 1) * (this.financialData.length - 1);
  }

  getPointPosition(index: number): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    const totalPoints = this.financialData.length;
    return (index / (totalPoints - 1)) * 100;
  }

  getPointBottomPosition(value: number): number {
    if (!this.financialData || this.financialData.length === 0) return 0;
    const maxValue = Math.max(...this.financialData.map(d => d.ejecutado), 1);
    const percentage = (value / maxValue) * 100;
    return percentage;
  }

  // Métodos para modal
  openStudentModal(student: StudentData) {
    this.selectedStudent = student;
    // Simular datos de becas para el estudiante
    this.studentBecas = [
      { nombre: 'Beca Académica', monto: 50000, fecha: '2024-01-15' },
      { nombre: 'Beca de Excelencia', monto: 75000, fecha: '2024-06-20' },
      { nombre: 'Beca de Investigación', monto: 100000, fecha: '2023-09-10' }
    ];
  }

  closeStudentModal() {
    this.selectedStudent = null;
  }

  onSearch() {
    if (!this.searchTerm) {
      this.filteredStudents = this.students;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredStudents = this.students.filter(student => 
        student.nombre.toLowerCase().includes(term) ||
        student.apellidos.toLowerCase().includes(term) ||
        student.carrera.toLowerCase().includes(term)
      );
    }
  }
}