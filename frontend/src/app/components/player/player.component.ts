import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SongService, Song } from '../../services/song.service';
import { AuthService, User } from '../../services/auth.service';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between h-16">
            <div class="flex items-center">
              <h1 class="text-xl font-semibold text-gray-900">WalkOnSongs Player</h1>
            </div>
            <div class="flex items-center space-x-4">
              <span class="text-gray-700" *ngIf="currentUser">
                {{ currentUser.firstName }} {{ currentUser.lastName }}
              </span>
              <a routerLink="/welcome" class="text-indigo-600 hover:text-indigo-500">Dashboard</a>
              <a routerLink="/songs" class="text-indigo-600 hover:text-indigo-500">Manage Songs</a>
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
          
          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Left Column: Search and Song List -->
            <div class="lg:col-span-2 space-y-6">
              
              <!-- Search Section -->
              <div class="bg-white rounded-lg shadow p-6">
                <div class="flex items-center space-x-4">
                  <div class="flex-1">
                    <label for="search" class="block text-sm font-medium text-gray-700 mb-2">Search Your Songs</label>
                    <div class="relative">
                      <input
                        id="search"
                        type="text"
                        [(ngModel)]="searchQuery"
                        (input)="onSearchChange()"
                        placeholder="Search by song name, guest..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                        </svg>
                      </div>
                    </div>
                  </div>
                  <button
                    (click)="clearSearch()"
                    *ngIf="searchQuery"
                    class="mt-6 px-4 py-2 text-gray-600 hover:text-gray-800">
                    Clear
                  </button>
                </div>
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

              <!-- Songs List -->
              <div class="bg-white rounded-lg shadow overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-medium text-gray-900">
                    Your Playlist 
                    <span class="text-sm text-gray-500">({{ filteredSongs.length }} songs)</span>
                  </h3>
                </div>

                <!-- Empty State -->
                <div *ngIf="!isLoading && filteredSongs.length === 0 && !searchQuery" class="text-center py-12">
                  <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                  </svg>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No songs in your playlist</h3>
                  <p class="text-gray-600 mb-4">Add some songs to start playing!</p>
                  <a
                    routerLink="/songs/add"
                    class="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Add Your First Song
                  </a>
                </div>

                <!-- No Search Results -->
                <div *ngIf="!isLoading && filteredSongs.length === 0 && searchQuery" class="text-center py-12">
                  <svg class="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                  <h3 class="text-lg font-semibold text-gray-900 mb-2">No songs found</h3>
                  <p class="text-gray-600">No songs match your search for "{{ searchQuery }}"</p>
                </div>

                <!-- Songs Table -->
                <div *ngIf="!isLoading && filteredSongs.length > 0" class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Song</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start</th>
                        <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr 
                        *ngFor="let song of filteredSongs"
                        (click)="selectSong(song)"
                        [class]="getSongRowClasses(song)"
                        class="transition-colors duration-200 cursor-pointer">
                        
                        <td class="px-4 py-3">
                          <div class="flex items-center">
                            <img 
                              [src]="getYouTubeThumbnail(song.youtube_id)" 
                              [alt]="song.song_name"
                              class="h-10 w-14 object-cover rounded">
                            <div class="ml-3">
                              <div class="text-sm font-medium text-gray-900">{{ song.song_name }}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td class="px-4 py-3">
                          <div class="text-sm text-gray-900">{{ song.guest_name || '-' }}</div>
                        </td>
                        
                        <td class="px-4 py-3">
                          <div class="text-sm text-gray-900">{{ formatTime(song.start_time_seconds) }}</div>
                        </td>
                        
                        <td class="px-4 py-3 text-sm">
                          <div class="flex items-center space-x-2">
                            <!-- Edit Icon -->
                            <a
                              [routerLink]="['/songs/edit', song.id]"
                              (click)="$event.stopPropagation()"
                              class="text-gray-600 hover:text-indigo-600"
                              title="Edit song">
                              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                              </svg>
                            </a>
                            
                            <!-- YouTube Icon -->
                            <a
                              [href]="getYouTubeUrl(song.youtube_id, song.start_time_seconds)"
                              target="_blank"
                              (click)="$event.stopPropagation()"
                              class="text-gray-600 hover:text-red-600"
                              title="Open in YouTube">
                              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </a>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            <!-- Right Column: YouTube Player -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-lg shadow-lg p-6 sticky top-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4 text-center">YouTube Player</h2>
                
                <!-- Current Song Info -->
                <div *ngIf="currentSong" class="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <h3 class="text-sm font-semibold text-indigo-900 truncate">{{ currentSong.song_name }}</h3>
                  <p class="text-xs text-indigo-700" *ngIf="currentSong.guest_name">Guest: {{ currentSong.guest_name }}</p>
                  <p class="text-xs text-indigo-600">Start: {{ formatTime(currentSong.start_time_seconds) }}</p>
                </div>

                <!-- YouTube Player Container -->
                <div class="mb-4">
                  <div class="relative">
                    <div 
                      #youtubePlayer 
                      id="youtube-player"
                      class="w-full"
                      style="aspect-ratio: 16/9;">
                    </div>
                    
                    <!-- Placeholder when no video selected -->
                    <div *ngIf="!currentSong" class="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div class="text-center p-4">
                        <svg class="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path>
                        </svg>
                        <p class="text-xs text-gray-600">Select a song to load player</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Player Controls -->
                <div *ngIf="currentSong" class="grid grid-cols-2 gap-2">
                  <button
                    (click)="playVideo()"
                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-xs flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd"></path>
                    </svg>
                    Play
                  </button>
                  
                  <button
                    (click)="pauseVideo()"
                    class="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-xs flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    Pause
                  </button>
                  
                  <button
                    (click)="restartVideo()"
                    class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd"></path>
                    </svg>
                    Restart
                  </button>
                  
                  <button
                    (click)="stopVideo()"
                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-xs flex items-center justify-center">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clip-rule="evenodd"></path>
                    </svg>
                    Stop
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
export class PlayerComponent implements OnInit, OnDestroy {
  @ViewChild('youtubePlayer', { static: false }) youtubePlayerRef!: ElementRef;
  
  songs: Song[] = [];
  filteredSongs: Song[] = [];
  currentSong: Song | null = null;
  currentUser: User | null = null;
  searchQuery = '';
  isLoading = true;
  errorMessage = '';
  
  private player: any = null;
  private playerReady = false;

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
    this.loadYouTubeAPI();
  }

  ngOnDestroy(): void {
    if (this.player) {
      this.player.destroy();
    }
  }

  loadYouTubeAPI(): void {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
      this.initializePlayer();
      return;
    }

    // Create script tag for YouTube API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      this.initializePlayer();
    };
  }

  initializePlayer(): void {
    if (!window.YT || !window.YT.Player) {
      setTimeout(() => this.initializePlayer(), 100);
      return;
    }

    this.player = new window.YT.Player('youtube-player', {
      height: '400',
      width: '100%',
      videoId: '',
      playerVars: {
        autoplay: 0,
        controls: 1,
        modestbranding: 1,
        rel: 0
      },
      events: {
        onReady: () => {
          this.playerReady = true;
        },
        onError: (event: any) => {
          console.error('YouTube Player Error:', event.data);
          this.errorMessage = 'Error loading YouTube video';
        }
      }
    });
  }

  loadSongs(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.songService.getSongs().subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.songs) {
          this.songs = response.songs;
          this.filteredSongs = [...this.songs];
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

  selectSong(song: Song): void {
    // Don't reload if same song is already selected
    if (this.currentSong?.id === song.id) {
      return;
    }
    
    this.currentSong = song;
    
    if (this.playerReady && this.player) {
      // Load video but don't autoplay
      this.player.cueVideoById({
        videoId: song.youtube_id,
        startSeconds: song.start_time_seconds || 0
      });
    }
  }

  playVideo(): void {
    if (this.player && this.playerReady) {
      this.player.playVideo();
    }
  }

  pauseVideo(): void {
    if (this.player && this.playerReady) {
      this.player.pauseVideo();
    }
  }

  stopVideo(): void {
    if (this.player && this.playerReady) {
      this.player.stopVideo();
    }
  }

  restartVideo(): void {
    if (this.player && this.playerReady && this.currentSong) {
      // Seek to the start time and play
      this.player.seekTo(this.currentSong.start_time_seconds || 0, true);
      this.player.playVideo();
    }
  }

  onSearchChange(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSongs = [...this.songs];
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredSongs = this.songs.filter(song =>
      song.song_name.toLowerCase().includes(query) ||
      (song.guest_name && song.guest_name.toLowerCase().includes(query))
    );
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredSongs = [...this.songs];
  }

  getSongRowClasses(song: Song): string {
    const baseClasses = 'hover:bg-gray-50';
    const selectedClasses = 'bg-indigo-50 border-l-4 border-indigo-500';
    
    return this.currentSong?.id === song.id 
      ? `${baseClasses} ${selectedClasses}` 
      : baseClasses;
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