import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpGateway } from './http.gateway';

@Injectable({ providedIn: 'root' })
export class ApiService implements HttpGateway {
  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: any): Observable<T> {
    return this.http.get<T>(url, { params: this.buildParams(params) }).pipe(
      catchError(this.handleError)
    );
  }

    getResponse<T>(url: string, params?: any): Observable<HttpResponse<T>> {
    return this.http
      .get<T>(url, {
        params: this.buildParams(params),
        observe: 'response'
      })
      .pipe(catchError(this.handleError));
  }
  post<T>(url: string, body: any): Observable<T> {
    return this.http.post<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  put<T>(url: string, body: any): Observable<T> {
    return this.http.put<T>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  delete<T>(url: string, id: string): Observable<T> {
    return this.http.delete<T>(`${url}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  private buildParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.append(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }
}
