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
    path: 'app',
    loadComponent: () => import('./components/wrapper/wrapper.component').then(m => m.WrapperComponent),
    canActivate: [AuthGuard],
    children: [
      { 
        path: 'welcome', 
        loadComponent: () => import('./components/welcome/welcome.component').then(m => m.WelcomeComponent)
      },
      { 
        path: 'player', 
        loadComponent: () => import('./components/player/player.component').then(m => m.PlayerComponent)
      },
      { 
        path: 'songs', 
        loadComponent: () => import('./components/songs/songs.component').then(m => m.SongsComponent)
      },
      { 
        path: 'songs/add', 
        loadComponent: () => import('./components/song-form/song-form.component').then(m => m.SongFormComponent)
      },
      { 
        path: 'songs/edit/:id', 
        loadComponent: () => import('./components/song-form/song-form.component').then(m => m.SongFormComponent)
      },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/login' }
];