import { Component } from '@angular/core';
import { InputComponent } from '../input/input.component';
import { ButtonComponent } from '../button/button.component';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackbarService } from '@paulelyson/elyui';
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
  passwordVisible: boolean = false;
  inputType: string = 'password';

  constructor(
    public dialogRef: MatDialogRef<LoginDialogComponent>,
    private authService: AuthService,
    private router: Router,
    private snackBarService: SnackbarService,
  ) {}

  login() {
    this.authService.login(this.schoolId.value, this.password.value).subscribe({
      next: () => {
        // Tokens are stored and the profile loaded inside AuthService.login —
        // by the time this fires, roles are available to the routes below.
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

  onPasswordSuffixIconClick() {
    this.passwordVisible = !this.passwordVisible;
    this.inputType = this.passwordVisible ? 'text' : 'password';
  }
}
