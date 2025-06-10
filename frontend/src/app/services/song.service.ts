import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Song {
  id: number;
  youtube_url: string;
  youtube_id: string;
  song_name: string;
  start_time_seconds: number;
  guest_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface SongCreateRequest {
  youtubeUrl: string;
  songName: string;
  startTimeSeconds?: number;
  guestName?: string;
}

export interface SongUpdateRequest {
  youtubeUrl?: string;
  songName?: string;
  startTimeSeconds?: number;
  guestName?: string;
}

export interface SongResponse {
  success: boolean;
  message?: string;
  song?: Song;
  songs?: Song[];
  errors?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class SongService {
  private apiUrl = 'http://localhost:3000/api/songs';

  constructor(private http: HttpClient) {}

  // Get all songs for the authenticated user
  getSongs(): Observable<SongResponse> {
    return this.http.get<SongResponse>(this.apiUrl);
  }

  // Get a specific song by ID
  getSong(id: number): Observable<SongResponse> {
    return this.http.get<SongResponse>(`${this.apiUrl}/${id}`);
  }

  // Create a new song
  createSong(songData: SongCreateRequest): Observable<SongResponse> {
    return this.http.post<SongResponse>(this.apiUrl, songData);
  }

  // Update an existing song
  updateSong(id: number, songData: SongUpdateRequest): Observable<SongResponse> {
    return this.http.put<SongResponse>(`${this.apiUrl}/${id}`, songData);
  }

  // Delete a song
  deleteSong(id: number): Observable<SongResponse> {
    return this.http.delete<SongResponse>(`${this.apiUrl}/${id}`);
  }

  // Helper function to extract YouTube video ID from URL (client-side validation)
  extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  }

  // Helper function to get YouTube thumbnail URL
  getYouTubeThumbnail(videoId: string): string {
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  }

  // Helper function to get YouTube embed URL with start time
  getYouTubeEmbedUrl(videoId: string, startTime?: number): string {
    const baseUrl = `https://www.youtube.com/embed/${videoId}`;
    return startTime ? `${baseUrl}?start=${startTime}` : baseUrl;
  }

  // Helper function to format time in seconds to MM:SS format
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}