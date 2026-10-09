import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'notes',
    loadComponent: () => import('./pages/notes/notes').then( p => p.Notes)
  },
  {
    path: 'prescription',
    loadComponent: () => import('./pages/prescriptions/prescriptions').then( p => p.Prescriptions)
  },
  {
    path: 'bin',
    loadComponent: () => import('./pages/bin/bin').then( p => p.Bin)
  },
  {
    path: '**',
    redirectTo: 'notes', //Cambiar por un valor funcional que pondra el usuario
  }
];
