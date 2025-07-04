import { Component, EventEmitter, Input, Output, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, DialogModule, ButtonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Input() headerTitle = '';
  @Input() dialogStyle: { [key: string]: any } = {};
  @Input() showCancelButton = true;
@Input() acceptDisabled: boolean = false;

  @Output() cancel = new EventEmitter<void>();
  @Output() accept = new EventEmitter<void>();

  @ContentChild('modal-footer') footerTemplate: any;
  get hasCustomFooter() {
    return !!this.footerTemplate;
  }

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
