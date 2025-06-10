import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { 
    path: 'register', 
    loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent)
  },
  { 
    path: 'login', 
    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent)
  },
  { 
    path: 'verify-email', 
    loadComponent: () => import('./components/email-verification/email-verification.component').then(m => m.EmailVerificationComponent)
  },
  { 
    path: 'welcome', 
    loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'player', 
    loadComponent: () => import('./components/player/player.component').then(m => m.PlayerComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'songs', 
    loadComponent: () => import('./components/songs/songs.component').then(m => m.SongsComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'songs/add', 
    loadComponent: () => import('./components/song-form/song-form.component').then(m => m.SongFormComponent),
    canActivate: [AuthGuard]
  },
  { 
    path: 'songs/edit/:id', 
    loadComponent: () => import('./components/song-form/song-form.component').then(m => m.SongFormComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/login' }
];