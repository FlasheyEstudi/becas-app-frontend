// Componente para mostrar un modal con información de beca
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-beca-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './beca-modal.html',
  styleUrls: ['./beca-modal.scss']
})
export class BecaModalComponent {
  // Propiedad de entrada para la beca
  @Input() beca: any = null;
  // Propiedad de entrada para controlar visibilidad del modal
  @Input() isOpen = false;
  // Evento de salida para cerrar el modal
  @Output() closeModal = new EventEmitter<void>();

  // Método para emitir evento de cierre del modal
  closeModalHandler() {
    this.closeModal.emit();
  }
}