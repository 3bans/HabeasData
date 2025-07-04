import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { StorageService } from '../../shared/utils/storage.service';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { API_URLS } from '../config/apiConfig';
import { jwtDecode } from 'jwt-decode';
interface LoginResponse {
  code: number;
  description: string;
  accessToken: string;
  nombre:string;
  user?: User;
}

interface LoginCredentials {
  user: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authUrl = API_URLS.gateway.login;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();


  constructor(
    private http: HttpClient,
    private storage: StorageService,
    private router: Router
  ) {
    this.loadInitialState();
  }

  private loadInitialState(): void {
    const token = this.storage.get('jwt_token');
    const user = this.storage.get('current_user');
    console.log(token);
    if (token && user) {
      this.currentUserSubject.next(JSON.parse(user));
    }
  }


// auth.service.ts
login(credentials: LoginCredentials): Observable<void> {
  const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

  return this.http.post<LoginResponse>(this.authUrl, credentials, { headers }).pipe(
    tap(response => {
      if (response.code === 200 && response.accessToken) {

        this.setToken(response.accessToken); // Solo guarda el token

         localStorage.setItem('nombre', response.nombre);

      } else {
        throw new Error('Credenciales inválidas');
      }
    }),
    map(() => {}), // Retorna un Observable<void>
    catchError(this.handleAuthError.bind(this))
  );
}

  logout(): void {
    this.storage.remove('jwt_token');
    this.storage.remove('current_user');
      this.storage.remove('token');
      this.storage.remove('punto');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }


getToken(): string | null {
  const token = this.storage.get('jwt_token');
  if (!token) return null;

  try {
    const decoded: any = jwtDecode(token);
    const now = Date.now() / 1000;

    if (decoded.exp && decoded.exp > now) {
      return token;
    } else {
      console.warn('⚠️ Token expirado');
      this.logout(); // Elimina token y redirige
      return null;
    }
  } catch (error) {
    console.error('❌ Token inválido:', error);
    this.logout();
    return null;
  }
  }

  private setToken(token: string): void {
    this.storage.set('jwt_token', token);
  }

  private setCurrentUser(user: User): void {
    this.storage.set('current_user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  public handleAuthError(error: any): Observable<never> {
    if (error.status === 401) {
      this.logout();
    }
    return throwError(() => ({
      message: this.getErrorMessage(error),
      originalError: error
    }));
  }

  private getErrorMessage(error: any): string {
    return error.error?.description || 'Error de autenticación';
  }

  // Añadir un método para enviar solicitudes autenticadas con el token
  private createAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json'
    });
  }


}


