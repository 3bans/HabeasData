import { CommonModule } from '@angular/common';
import { PrimeNGModule } from '../../ui/primeng/primeng.module';
import { Component, OnInit } from '@angular/core';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [PrimeNGModule, CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {



nombreUsuario: string | null = null;
  estaLogueado: boolean = false;

  constructor(public router: Router) {}

  ngOnInit(): void {
    const token = localStorage.getItem('jwt_token');
    this.estaLogueado = !!token;
    if (this.estaLogueado) {
      this.nombreUsuario = localStorage.getItem('nombre');
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goHome() {
    this.router.navigate(['/menu']);
  }

  getInitials(name: string | null): string {
    return name
      ? name
          .split(' ')
          .map(n => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      : '';
  }
}
