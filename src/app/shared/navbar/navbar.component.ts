import { CommonModule } from '@angular/common';
import { PrimeNGModule } from '../../ui/primeng/primeng.module';
import { Component } from '@angular/core';

@Component({

   selector: 'app-navbar',
   imports: [PrimeNGModule],
   templateUrl: './navbar.component.html',
   styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent { }
