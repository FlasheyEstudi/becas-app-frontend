import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Interfaz para el modelo del formulario de solicitud
interface SolicitudFormModel {
  estudianteId: number;
  tipoBecaId: number;
  estadoId: number;
  fechaSolicitud: string;
  periodoAcademicoId: number;
  observaciones?: string | null;
  fechaResultado?: string | null;
}

@Component({
  selector: 'app-beca-solicitud-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './beca-solicitud-modal.html',
  styleUrls: ['./beca-solicitud-modal.scss']
})
export class BecaSolicitudModalComponent implements OnInit {
  @Input() beca: any = null;
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() solicitarBeca = new EventEmitter<any>();

  solicitudFormModel: SolicitudFormModel = {
    estudianteId: 0,
    tipoBecaId: 0,
    estadoId: 1, // Fijado como "Pendiente"
    fechaSolicitud: new Date().toISOString().split('T')[0],
    periodoAcademicoId: 1, // Valor por defecto, ajusta según tu lógica
    observaciones: null,
    fechaResultado: null
  };

  ngOnInit(): void {
    // Prellenar estudianteId desde el token
    const token = localStorage.getItem('token');
    if (token && this.beca) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.solicitudFormModel.estudianteId = payload.sub || payload.id;
        this.solicitudFormModel.tipoBecaId = this.beca.id;
      } catch (err) {
        console.error('Error al decodificar token:', err);
      }
    }
  }

  closeModalHandler() {
    this.closeModal.emit();
  }

  onSubmit() {
    const payload = {
      ...this.solicitudFormModel,
      observaciones: this.solicitudFormModel.observaciones || null,
      fechaResultado: this.solicitudFormModel.fechaResultado || null
    };
    this.solicitarBeca.emit({
      beca: this.beca,
      datos: payload
    });
  }
}