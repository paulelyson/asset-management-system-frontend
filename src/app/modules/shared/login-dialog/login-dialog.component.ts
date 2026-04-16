import { Component } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '../../../services/snackbar.service';
import { MatDialogRef } from '@angular/material/dialog';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login-dialog',
  imports: [InputComponent, ButtonComponent, FormsModule, ReactiveFormsModule],
  templateUrl: './login-dialog.component.html',
  styleUrl: './login-dialog.component.css',
})
export class LoginDialogComponent {
  schoolId = new FormControl('', { nonNullable: true });
  password = new FormControl('', { nonNullable: true });

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackbarService,
  ) {}

  login() {
    this.authService.login(this.schoolId.value, this.password.value).subscribe({
      next: (resp) => {
        localStorage.setItem('token', resp.access_token);
        this.router.navigate(['/borrow']);
        this.dialogRef.close('login_success');
      },
      error: (err) => {
        this.snackBarService.openSnackbar({
          type: 'error',
          message: [err.message],
          icon: 'info',
        });
      },
    });
  }
}
