import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

// 🔒 Change this to your actual Firebase project region + project ID if different
const FUNCTIONS_BASE = 'https://us-central1-sorting-visualizer-fab3f.cloudfunctions.net';

type ServerStatus = 'RUNNING' | 'TERMINATED' | 'STAGING' | 'STOPPING' | 'UNKNOWN' | 'LOADING';

@Component({
  selector: 'app-server-control',
  templateUrl: './server-control.component.html',
  styleUrls: ['./server-control.component.scss']
})
export class ServerControlComponent implements OnInit, OnDestroy {
  status: ServerStatus = 'LOADING';
  actionInProgress = false;
  message = '';
  ip: string | null = null;
  private pollInterval: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchStatus();
    // Poll every 10 seconds to keep status fresh
    this.pollInterval = setInterval(() => this.fetchStatus(), 10000);
  }

  ngOnDestroy(): void {
    clearInterval(this.pollInterval);
  }

  fetchStatus(): void {
    this.http.get<{ status: string, ip: string | null }>(`${FUNCTIONS_BASE}/getServerStatus`)
      .subscribe({
        next: (res) => {
          this.status = res.status as ServerStatus;
          this.ip = res.ip;
          // Clear messages once server has reached a stable state
          if (this.status === 'RUNNING' || this.status === 'TERMINATED') {
            this.message = '';
          }
        },
        error: () => this.status = 'UNKNOWN'
      });
  }

  startServer(): void {
    this.actionInProgress = true;
    this.message = '';
    this.http.post<{ message: string }>(`${FUNCTIONS_BASE}/startServer`, {})
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.status = 'STAGING';
          this.actionInProgress = false;
        },
        error: () => {
          this.message = 'Failed to start server. Try again.';
          this.actionInProgress = false;
        }
      });
  }

  stopServer(): void {
    this.actionInProgress = true;
    this.message = '';
    this.http.post<{ message: string }>(`${FUNCTIONS_BASE}/stopServer`, {})
      .subscribe({
        next: (res) => {
          this.message = res.message;
          this.status = 'STOPPING';
          this.actionInProgress = false;
        },
        error: () => {
          this.message = 'Failed to stop server. Try again.';
          this.actionInProgress = false;
        }
      });
  }

  get statusLabel(): string {
    const labels: Record<ServerStatus, string> = {
      RUNNING: 'Online',
      TERMINATED: 'Offline',
      STAGING: 'Starting...',
      STOPPING: 'Stopping...',
      UNKNOWN: 'Unknown',
      LOADING: 'Checking...'
    };
    return labels[this.status];
  }

  get isRunning(): boolean { return this.status === 'RUNNING'; }
  get isStopped(): boolean { return this.status === 'TERMINATED'; }
  get isTransitioning(): boolean { return this.status === 'STAGING' || this.status === 'STOPPING'; }
}
