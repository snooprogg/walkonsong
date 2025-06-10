import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">WalkOnSongs</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700" *ngIf="currentUser">
                Welcome, {{ currentUser.firstName }} {{ currentUser.lastName }}
              </span>
              <a
                routerLink="/player"
                class="text-indigo-600 hover:text-indigo-500 font-medium">
                Player
              </a>
              <a
                routerLink="/songs"
                class="text-indigo-600 hover:text-indigo-500 font-medium">
                My Playlist
              </a>
              <button
                (click)="logout()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <div class="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div class="text-center">
              <h2 class="text-3xl font-bold text-gray-900 mb-4">
                Welcome to WalkOnSongs!
              </h2>
              <p class="text-lg text-gray-600 mb-8">
                You have successfully logged in and verified your email. Start building your YouTube playlist!
              </p>
              
              <!-- Quick Actions -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
                <a
                  routerLink="/player"
                  class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div class="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">YouTube Player</h3>
                  <p class="text-gray-600">Play your YouTube songs with embedded player</p>
                </a>
                
                <a
                  routerLink="/songs"
                  class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div class="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">My Playlist</h3>
                  <p class="text-gray-600">View and manage your YouTube songs</p>
                </a>
                
                <a
                  routerLink="/songs/add"
                  class="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
                  <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">Add New Song</h3>
                  <p class="text-gray-600">Add a YouTube song to your playlist</p>
                </a>
              </div>

              <div class="bg-white p-6 rounded-lg shadow-md max-w-md mx-auto" *ngIf="currentUser">
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Your Profile</h3>
                <div class="text-left space-y-2">
                  <p><span class="font-medium">Name:</span> {{ currentUser.firstName }} {{ currentUser.lastName }}</p>
                  <p><span class="font-medium">Email:</span> {{ currentUser.email }}</p>
                  <p><span class="font-medium">Status:</span> <span class="text-green-600">Verified</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class WelcomeComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}