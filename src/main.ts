import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http'; // Para HttpClient

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes), // Provee las rutas
    provideHttpClient() // Provee HttpClient para AuthService
  ]
}).catch(err => console.error(err));