import { Component } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { Button, SnackbarService, Toggle } from '@paulelyson/elyui';
import { AuthService } from '../../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-password-dialog',
  imports: [InputComponent, Button, Toggle, FormsModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css',
})
export class ChangePasswordDialogComponent {
  currentPassword: string = '';
  newPassword: string = '';
  // No `user` field: the backend scopes the change to the authenticated caller,
  // so this dialog never needed to know who that is.
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {}
  passwordVisible: boolean = false;
  inputType: string = 'password';

  onShowPassword() {
    this.passwordVisible = !this.passwordVisible;
    this.inputType = this.passwordVisible ? 'text' : 'password';
  }

  onPasswordUpdate() {
    this.authService
      .changePassword(this.currentPassword, this.newPassword)
      .subscribe({
        next: (resp) => {
          this.snackbarService.openSnackbar({
            type: 'success',
            message: [resp.message],
            icon: '',
          });
          this.dialogRef.close('success');
        },
        error: (err) => {
          this.snackbarService.openSnackbar({
            type: 'error',
            message: [err],
            icon: '',
          });
        },
      });
  }
}
