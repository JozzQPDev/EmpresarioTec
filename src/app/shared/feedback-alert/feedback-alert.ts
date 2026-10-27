import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type FeedbackAlertType = 'success' | 'error';
export type FeedbackAlertVariant = 'inline' | 'toast' | 'toast-bottom';

@Component({
  selector: 'app-feedback-alert',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './feedback-alert.html',
  styleUrl: './feedback-alert.css'
})
export class FeedbackAlertComponent implements OnDestroy {
  private dismissalTimer?: ReturnType<typeof setTimeout>;
  private exitTimer?: ReturnType<typeof setTimeout>;
  private currentMessage = '';

  visible = false;
  leaving = false;

  @Input()
  set message(value: string) {
    this.currentMessage = value;
    this.visible = Boolean(value);
    this.leaving = false;
    this.clearDismissalTimer();
    this.clearExitTimer();

    if (this.visible) {
      this.dismissalTimer = setTimeout(() => this.dismiss(), 5000);
    }
  }

  get message(): string {
    return this.currentMessage;
  }

  @Input() type: FeedbackAlertType = 'error';
  @Input() variant: FeedbackAlertVariant = 'inline';
  @Output() dismissed = new EventEmitter<void>();

  dismiss(): void {
    if (!this.visible || this.leaving) return;

    this.leaving = true;
    this.clearDismissalTimer();
    this.exitTimer = setTimeout(() => {
      this.visible = false;
      this.leaving = false;
      this.dismissed.emit();
    }, 180);
  }

  ngOnDestroy(): void {
    this.clearDismissalTimer();
    this.clearExitTimer();
  }

  private clearDismissalTimer(): void {
    if (this.dismissalTimer) {
      clearTimeout(this.dismissalTimer);
      this.dismissalTimer = undefined;
    }
  }

  private clearExitTimer(): void {
    if (this.exitTimer) {
      clearTimeout(this.exitTimer);
      this.exitTimer = undefined;
    }
  }
}
