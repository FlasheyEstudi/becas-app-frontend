import { Routes } from '@angular/router';

import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { DashboardComponent } from './dashboard/dashboard';
import { EstudiantesComponent } from './estudiantes/estudiantes';
import { CarrerasComponent } from './carreras/carreras';
import { AreaConocimientoComponent } from './AreasConocimientos/area-conocimiento';
import { RequisitosComponent } from './requisitos/requisitos';
import { TipoBecaComponent } from './TipoBeca/tipo-beca';
import { PeriodoAcademicoComponent } from './periodo-academico/periodo-academico';
import { SolicitudBecaComponent } from './solicitud-beca/solicitud-beca';
import { EstadoComponent } from './estado/estado';
import { DetalleRequisitosBecaComponent } from './detalle-requisito-beca/detalle-requisitos-beca';
import { DocumentoComponent } from './documento/documento';
import { EvaluacionComponent } from './evaluacion/evaluacion';
import { CriterioEvaluacionComponent } from './criterio-evaluacion/criterio-evaluacion';
import { DetalleEvaluacionComponent } from './detalle-evaluacion/detalle-evaluacion';
import { NotificacionComponent } from './notificacion/notificacion';
import { AuditoriaComponent } from './auditoria/auditoria';

import { AuthGuard } from './auth/guards/auth.guard';
import { RoleGuard } from './auth/guards/role.guard';

// Nuevos componentes estudiantes
import { PerfilComponent } from './estudiantes/perfil/perfil';
import { BecasDisponiblesComponent } from './estudiantes/becas-disponibles/becas-disponibles';
import { MisSolicitudesComponent } from './estudiantes/mis-solicitudes/mis-solicitudes';
import { BecaDetalleComponent } from './estudiantes/beca-detalle/beca-detalle';
import { ConfiguracionComponent } from './configuracion/configuracion';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  // Dashboard accesible para admin y estudiante
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'estudiante'] }
  },

  // Rutas solo admin
  { path: 'estudiantes', component: EstudiantesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'carreras', component: CarrerasComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'area-conocimiento', component: AreaConocimientoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'requisitos', component: RequisitosComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'tipo-beca', component: TipoBecaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'periodo-academico', component: PeriodoAcademicoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'solicitud-beca', component: SolicitudBecaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'estado', component: EstadoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'detalle-requisitos-beca', component: DetalleRequisitosBecaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'documento', component: DocumentoComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'evaluacion', component: EvaluacionComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'criterio-evaluacion', component: CriterioEvaluacionComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'detalle-evaluacion', component: DetalleEvaluacionComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'notificacion', component: NotificacionComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'auditoria', component: AuditoriaComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  { path: 'configuracion', component: ConfiguracionComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['admin'] } },
  // Rutas solo estudiante
  { path: 'perfil', component: PerfilComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['estudiante'] } },
  { path: 'becas-disponibles', component: BecasDisponiblesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['estudiante'] } },
  { path: 'beca-detalle', component: BecaDetalleComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['estudiante'] } },
  { path: 'mis-solicitudes', component: MisSolicitudesComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['estudiante'] } },

  // Redirect por defecto y rutas no encontradas
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];
