// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { EstudiantesComponent } from './estudiantes/estudiantes';
import { CarrerasComponent } from './carreras/carreras';
import { AreaConocimientoComponent } from './AreasConocimientos/area-conocimiento'; // Agregar esta línea
import { RequisitosComponent } from './requisitos/requisitos'; // Agregar esta línea
import { TipoBecaComponent } from './TipoBeca/tipo-beca';
import { PeriodoAcademicoComponent } from './periodo-academico/periodo-academico';
import { SolicitudBecaComponent } from './solicitud-beca/solicitud-beca';
import { EstadoComponent } from './estado/estado';
import { DetalleRequisitosBecaComponent } from './detalle-requisito-beca/detalle-requisitos-beca';
import { AuthGuard } from './auth/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'estudiantes', component: EstudiantesComponent, canActivate: [AuthGuard] },
  { path: 'carreras', component: CarrerasComponent, canActivate: [AuthGuard] },
  { path: 'area-conocimiento', component: AreaConocimientoComponent, canActivate: [AuthGuard] }, // Agregar esta línea
  { path: 'requisitos', component: RequisitosComponent, canActivate: [AuthGuard] }, // Agregar esta línea
  {path:'tipo-beca', component:TipoBecaComponent, canActivate: [AuthGuard]},
  {path:'periodo-academico', component:PeriodoAcademicoComponent, canActivate:[AuthGuard]},
   {path:'solicitud-beca', component:SolicitudBecaComponent, canActivate:[AuthGuard]},
   { path: 'estado', component: EstadoComponent, canActivate: [AuthGuard] },
      {path:'detalle-requisitos-beca', component:DetalleRequisitosBecaComponent, canActivate:[AuthGuard]},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];