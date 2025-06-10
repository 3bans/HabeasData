// modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [ CommonModule, DialogModule, ButtonModule ],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();

  @Input() headerTitle = '';

  /** Aquí recibes cualquier objeto CSS válido */
  @Input() dialogStyle: { [key: string]: any } = {};

  @Output() cancel = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
    this.cancel.emit();
  }

  onAccept() {
    this.accept.emit();
    this.onClose();
  }
}
