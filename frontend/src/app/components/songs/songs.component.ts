import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SongService, Song } from '../../services/song.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-songs',
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
                {{ currentUser.firstName }} {{ currentUser.lastName }}
              </span>
              <a routerLink="/welcome" class="text-indigo-600 hover:text-indigo-500">Dashboard</a>
              <a routerLink="/player" class="text-indigo-600 hover:text-indigo-500">Player</a>
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
          <!-- Header -->
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">My Playlist</h2>
              <p class="text-gray-600">Manage your YouTube song collection</p>
            </div>
            <a
              routerLink="/songs/add"
              class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              Add New Song
            </a>
          </div>

          <!-- Loading State -->
          <div *ngIf="isLoading" class="flex justify-center items-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2 text-gray-600">Loading songs...</span>
          </div>

          <!-- Error Message -->
          <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {{ errorMessage }}
          </div>

          <!-- Success Message -->
          <div *ngIf="successMessage" class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            {{ successMessage }}
          </div>

          <!-- Empty State -->
          <div *ngIf="!isLoading && songs.length === 0" class="text-center py-12">
            <div class="bg-white rounded-lg shadow p-8">
              <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
              </svg>
              <h3 class="text-lg font-semibold text-gray-900 mb-2">No songs yet</h3>
              <p class="text-gray-600 mb-4">Start building your playlist by adding your first song!</p>
              <a
                routerLink="/songs/add"
                class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Add Your First Song
              </a>
            </div>
          </div>

          <!-- Songs Grid -->
          <div *ngIf="!isLoading && songs.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div *ngFor="let song of songs" class="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
              <!-- YouTube Thumbnail -->
              <div class="relative">
                <img
                  [src]="getYouTubeThumbnail(song.youtube_id)"
                  [alt]="song.song_name"
                  class="w-full h-48 object-cover rounded-t-lg">
                <div class="absolute inset-0 bg-black bg-opacity-30 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <a
                    [href]="getYouTubeUrl(song.youtube_id, song.start_time_seconds)"
                    target="_blank"
                    class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                    ▶ Watch on YouTube
                  </a>
                </div>
              </div>

              <!-- Song Details -->
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 truncate">{{ song.song_name }}</h3>
                
                <div class="space-y-2 text-sm text-gray-600">
                  <div *ngIf="song.guest_name" class="flex items-center">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    <span>{{ song.guest_name }}</span>
                  </div>
                  
                  <div class="flex items-center">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>Start: {{ formatTime(song.start_time_seconds) }}</span>
                  </div>
                  
                  <div class="flex items-center">
                    <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                    </svg>
                    <span>{{ formatDate(song.created_at) }}</span>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <a
                    [routerLink]="['/songs/edit', song.id]"
                    class="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Edit
                  </a>
                  <button
                    (click)="deleteSong(song)"
                    class="text-red-600 hover:text-red-700 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `
})
export class SongsComponent implements OnInit {
  songs: Song[] = [];
  currentUser: User | null = null;
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  constructor(
    private songService: SongService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
    
    this.loadSongs();
  }

  loadSongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.songService.getSongs().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.songs) {
          this.songs = response.songs;
        } else {
          this.errorMessage = response.message || 'Failed to load songs';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to load songs';
      }
    });
  }

  deleteSong(song: Song): void {
    if (confirm(`Are you sure you want to delete "${song.song_name}"?`)) {
      this.songService.deleteSong(song.id).subscribe({
        next: (response) => {
          if (response.success) {
            this.successMessage = 'Song deleted successfully';
            this.loadSongs(); // Reload the list
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message || 'Failed to delete song';
          }
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Failed to delete song';
        }
      });
    }
  }

  getYouTubeThumbnail(videoId: string): string {
    return this.songService.getYouTubeThumbnail(videoId);
  }

  getYouTubeUrl(videoId: string, startTime: number): string {
    const baseUrl = `https://www.youtube.com/watch?v=${videoId}`;
    return startTime > 0 ? `${baseUrl}&t=${startTime}s` : baseUrl;
  }

  formatTime(seconds: number): string {
    return this.songService.formatTime(seconds);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}