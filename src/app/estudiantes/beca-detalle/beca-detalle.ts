// Componente para mostrar detalles de una beca
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-beca-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './beca-detalle.html',
  styleUrls: ['./beca-detalle.scss']
})
export class BecaDetalleComponent implements OnInit {
  // Objeto para almacenar la beca seleccionada
  beca: any = null;

  constructor(private router: Router) {}

  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit() {
    // Recibir datos del estado de navegación
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.beca = navigation.extras.state['beca'];
      console.log('Beca recibida:', this.beca);
    }
    // Si no hay datos, redirigir al inicio
    if (!this.beca) {
      this.router.navigate(['/becas-disponibles']);
    }
  }

  // Método para volver a la página anterior
  volver() {
    this.router.navigate(['/becas-disponibles']);
  }

  // Método para solicitar la beca
  solicitarBeca() {
    console.log('Solicitando beca:', this.beca);
    // Redirigir a Mis Solicitudes
    this.router.navigate(['/mis-solicitudes']);
  }
}