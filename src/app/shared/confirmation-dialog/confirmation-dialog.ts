import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export type ConfirmationTone = 'danger' | 'primary' | 'success';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-dialog.html',
})
export class ConfirmationDialogComponent {
  @Input() open = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '';
  @Input() details = '';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmationText: string | null = null;
  @Input() confirmationPrompt = '';
  @Input() confirmationValue = '';
  @Input() tone: ConfirmationTone = 'primary';
  @Input() busy = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  @Output() confirmationValueChange = new EventEmitter<string>();

  get canConfirm(): boolean {
    if (this.busy) return false;
    if (this.confirmationText === null) return true;

    return this.confirmationText.trim().length > 0
      && this.confirmationValue.trim().toLocaleLowerCase()
        === this.confirmationText.trim().toLocaleLowerCase();
  }

  updateConfirmationValue(value: string): void {
    this.confirmationValue = value;
    this.confirmationValueChange.emit(value);
  }

  confirm(): void {
    if (this.canConfirm) this.confirmed.emit();
  }

  cancel(): void {
    if (!this.busy) this.cancelled.emit();
  }
}
