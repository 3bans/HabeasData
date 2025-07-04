// login.component.ts
import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../core/auth/auth.service';
import { NavbarComponent } from "../../../../shared/navbar/navbar.component";
import { PrimeNGModule } from '../../../../ui/primeng/primeng.module';
import { InputComponent } from '../../../../shared/input-text/input-text.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NavbarComponent,
    PrimeNGModule,
    InputComponent,
  ]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    user: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  errorMessage: string | null = null;
  loading = false;

  get username() {
    return this.loginForm.get('user');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;
    this.errorMessage = null;

    const credentials = this.loginForm.getRawValue();

    this.authService.login(credentials).subscribe({
      next: () => { // No recibe parámetro "success"
        this.loading = false;
localStorage.setItem('token', this.loginForm.get('user')?.value || '');

  this.router.navigate(['/menu']);
        console.log("home");
      },
      error: (err) => {
        this.loading = false;
        this.handleError(err);
      }
    });
  }

  private handleError(error: any): void {
    this.errorMessage = this.getErrorMessage(error);
    console.error('Login error:', error);
  }

  private getErrorMessage(error: any): string {
    console.log(error);
    // Verifica primero el estado del error original (HttpErrorResponse)
    if (error.originalError?.status === 404) return 'Credenciales inválidas o usuario no tiene acceso a la aplicación';
    if (error.originalError?.status === 0) return 'Error de conexión con el servidor';

    // Luego, verifica si hay un mensaje en el objeto error
    if (error.message) return error.message;

    // Finalmente, mensaje por defecto
    return 'Error desconocido. Intente nuevamente.';
}
}
