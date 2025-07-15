import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ Necesario si estás usando standalone components
  imports: [RouterOutlet, Toast],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'] // ✅ en plural
})
export class AppComponent {
  title = 'habeasPacientes';
}
