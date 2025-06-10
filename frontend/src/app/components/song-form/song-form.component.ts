import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { SongService, Song } from '../../services/song.service';
import { AuthService, User } from '../../services/auth.service';

@Component({
  selector: 'app-song-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
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
              <a routerLink="/player" class="text-indigo-600 hover:text-indigo-500">Player</a>
              <a routerLink="/songs" class="text-indigo-600 hover:text-indigo-500">My Playlist</a>
              <button
                (click)="logout()"
                class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">
          <!-- Header -->
          <div class="mb-8">
            <nav class="flex" aria-label="Breadcrumb">
              <ol class="flex items-center space-x-4">
                <li>
                  <a routerLink="/songs" class="text-gray-500 hover:text-gray-700">My Playlist</a>
                </li>
                <li>
                  <svg class="flex-shrink-0 h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
                  </svg>
                </li>
                <li>
                  <span class="text-gray-700">{{ isEditMode ? 'Edit Song' : 'Add New Song' }}</span>
                </li>
              </ol>
            </nav>
            <h2 class="mt-4 text-2xl font-bold text-gray-900">
              {{ isEditMode ? 'Edit Song' : 'Add New Song' }}
            </h2>
            <p class="text-gray-600">
              {{ isEditMode ? 'Update your song details below' : 'Add a new YouTube song to your playlist' }}
            </p>
          </div>

          <!-- Loading State for Edit -->
          <div *ngIf="isEditMode && isLoadingSong" class="flex justify-center items-center py-12">
            <svg class="animate-spin h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="ml-2 text-gray-600">Loading song...</span>
          </div>

          <!-- Form -->
          <div *ngIf="!isLoadingSong" class="bg-white shadow rounded-lg p-6">
            <form [formGroup]="songForm" (ngSubmit)="onSubmit()">
              <!-- YouTube URL -->
              <div class="mb-6">
                <label for="youtubeUrl" class="block text-sm font-medium text-gray-700 mb-2">
                  YouTube URL <span class="text-red-500">*</span>
                </label>
                <input
                  id="youtubeUrl"
                  name="youtubeUrl"
                  type="url"
                  formControlName="youtubeUrl"
                  (blur)="onYouTubeUrlChange()"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="https://www.youtube.com/watch?v=...">
                <div *ngIf="songForm.get('youtubeUrl')?.touched && songForm.get('youtubeUrl')?.errors" class="text-red-600 text-sm mt-1">
                  <div *ngIf="songForm.get('youtubeUrl')?.errors?.['required']">YouTube URL is required</div>
                  <div *ngIf="songForm.get('youtubeUrl')?.errors?.['url']">Please enter a valid URL</div>
                  <div *ngIf="songForm.get('youtubeUrl')?.errors?.['invalidYouTube']">Please enter a valid YouTube URL</div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Paste a YouTube video URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
                </p>
              </div>

              <!-- YouTube Preview -->
              <div *ngIf="youtubePreview" class="mb-6">
                <div class="bg-gray-50 rounded-lg p-4">
                  <h4 class="text-sm font-medium text-gray-700 mb-3">YouTube Preview</h4>
                  <div class="flex items-start space-x-4">
                    <img
                      [src]="youtubePreview.thumbnail"
                      [alt]="youtubePreview.title"
                      class="w-32 h-20 object-cover rounded">
                    <div>
                      <p class="text-sm font-medium text-gray-900">{{ youtubePreview.title }}</p>
                      <p class="text-xs text-gray-500">Video ID: {{ youtubePreview.videoId }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Song Name -->
              <div class="mb-6">
                <label for="songName" class="block text-sm font-medium text-gray-700 mb-2">
                  Song Name <span class="text-red-500">*</span>
                </label>
                <input
                  id="songName"
                  name="songName"
                  type="text"
                  formControlName="songName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter the song name">
                <div *ngIf="songForm.get('songName')?.touched && songForm.get('songName')?.errors" class="text-red-600 text-sm mt-1">
                  <div *ngIf="songForm.get('songName')?.errors?.['required']">Song name is required</div>
                  <div *ngIf="songForm.get('songName')?.errors?.['maxlength']">Song name must be 200 characters or less</div>
                </div>
              </div>

              <!-- Start Time -->
              <div class="mb-6">
                <label for="startTimeSeconds" class="block text-sm font-medium text-gray-700 mb-2">
                  Start Time (seconds)
                </label>
                <input
                  id="startTimeSeconds"
                  name="startTimeSeconds"
                  type="number"
                  min="0"
                  formControlName="startTimeSeconds"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0">
                <div *ngIf="songForm.get('startTimeSeconds')?.touched && songForm.get('startTimeSeconds')?.errors" class="text-red-600 text-sm mt-1">
                  <div *ngIf="songForm.get('startTimeSeconds')?.errors?.['min']">Start time must be 0 or greater</div>
                </div>
                <p class="text-xs text-gray-500 mt-1">
                  Time in seconds where the song should start playing (leave 0 for beginning)
                </p>
              </div>

              <!-- Guest Name -->
              <div class="mb-6">
                <label for="guestName" class="block text-sm font-medium text-gray-700 mb-2">
                  Guest Name
                </label>
                <input
                  id="guestName"
                  name="guestName"
                  type="text"
                  formControlName="guestName"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter guest name (optional)">
                <div *ngIf="songForm.get('guestName')?.touched && songForm.get('guestName')?.errors" class="text-red-600 text-sm mt-1">
                  <div *ngIf="songForm.get('guestName')?.errors?.['maxlength']">Guest name must be 100 characters or less</div>
                </div>
              </div>

              <!-- Error Message -->
              <div *ngIf="errorMessage" class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                {{ errorMessage }}
              </div>

              <!-- Form Actions -->
              <div class="flex justify-end space-x-4">
                <a
                  routerLink="/songs"
                  class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  Cancel
                </a>
                <button
                  type="submit"
                  [disabled]="songForm.invalid || isSubmitting"
                  class="px-4 py-2 bg-indigo-600 border border-transparent rounded-md text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed">
                  <span *ngIf="isSubmitting" class="mr-2">
                    <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                  {{ isSubmitting ? (isEditMode ? 'Updating...' : 'Adding...') : (isEditMode ? 'Update Song' : 'Add Song') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  `
})
export class SongFormComponent implements OnInit {
  songForm: FormGroup;
  currentUser: User | null = null;
  isEditMode = false;
  isSubmitting = false;
  isLoadingSong = false;
  errorMessage = '';
  songId: number | null = null;
  youtubePreview: { videoId: string; thumbnail: string; title: string } | null = null;

  constructor(
    private fb: FormBuilder,
    private songService: SongService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.songForm = this.fb.group({
      youtubeUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/), this.youtubeUrlValidator]],
      songName: ['', [Validators.required, Validators.maxLength(200)]],
      startTimeSeconds: [0, [Validators.min(0)]],
      guestName: ['', [Validators.maxLength(100)]]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditMode = true;
        this.songId = parseInt(params['id']);
        this.loadSong();
      }
    });
  }

  youtubeUrlValidator(control: any) {
    if (!control.value) return null;
    
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const isValid = youtubeRegex.test(control.value);
    
    return isValid ? null : { invalidYouTube: true };
  }

  loadSong(): void {
    if (!this.songId) return;

    this.isLoadingSong = true;
    this.songService.getSong(this.songId).subscribe({
      next: (response) => {
        this.isLoadingSong = false;
        if (response.success && response.song) {
          const song = response.song;
          this.songForm.patchValue({
            youtubeUrl: song.youtube_url,
            songName: song.song_name,
            startTimeSeconds: song.start_time_seconds,
            guestName: song.guest_name || ''
          });
          this.updateYouTubePreview(song.youtube_url);
        } else {
          this.errorMessage = response.message || 'Song not found';
        }
      },
      error: (error) => {
        this.isLoadingSong = false;
        this.errorMessage = error.error?.message || 'Failed to load song';
      }
    });
  }

  onYouTubeUrlChange(): void {
    const url = this.songForm.get('youtubeUrl')?.value;
    if (url && this.songForm.get('youtubeUrl')?.valid) {
      this.updateYouTubePreview(url);
    } else {
      this.youtubePreview = null;
    }
  }

  updateYouTubePreview(url: string): void {
    const videoId = this.songService.extractYouTubeId(url);
    if (videoId) {
      this.youtubePreview = {
        videoId,
        thumbnail: this.songService.getYouTubeThumbnail(videoId),
        title: 'YouTube Video Preview'
      };
    } else {
      this.youtubePreview = null;
    }
  }

  onSubmit(): void {
    if (this.songForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';

      const formData = {
        youtubeUrl: this.songForm.value.youtubeUrl,
        songName: this.songForm.value.songName,
        startTimeSeconds: this.songForm.value.startTimeSeconds || 0,
        guestName: this.songForm.value.guestName || undefined
      };

      const request = this.isEditMode && this.songId
        ? this.songService.updateSong(this.songId, formData)
        : this.songService.createSong(formData);

      request.subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.success) {
            this.router.navigate(['/songs']);
          } else {
            this.errorMessage = response.message || 'Operation failed';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.errorMessage = error.error?.message || 'Operation failed. Please try again.';
        }
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}