import { Observable } from 'rxjs';

export interface HttpGateway {
  get<T>(url: string, params?: any): Observable<T>;
  post<T>(url: string, body: any): Observable<T>;
  put<T>(url: string, body: any): Observable<T>;
  delete<T>(url: string, id: string): Observable<T>;
}
