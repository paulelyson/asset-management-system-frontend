import { Component } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { ToggleComponent } from '../toggle/toggle.component';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { IUser } from '../../../models/User';
import { FormsModule } from '@angular/forms';
import { SnackbarService } from '../../../services/snackbar.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-change-password-dialog',
  imports: [InputComponent, ButtonComponent, ToggleComponent, FormsModule],
  templateUrl: './change-password-dialog.component.html',
  styleUrl: './change-password-dialog.component.css',
})
export class ChangePasswordDialogComponent {
  currentPassword: string = '';
  newPassword: string = '';
  user: IUser;
  constructor(
    public dialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    private authService: AuthService,
    private snackbarService: SnackbarService,
  ) {
    this.user = this.authService.getUser();
  }
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
