import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

declare global {
    interface Window {
        google: any;
    }
}

@Injectable({ providedIn: 'root' })
export class GoogleAuthService {
    private tokenClient: any;
    private initStarted = false;
    private initScopes: string[] = [];
    private waitTimerId: number | null = null;
    private tokenWaiters: Array<(token: string) => void> = [];
    private tokenErrorWaiters: Array<(reason: unknown) => void> = [];

    accessToken = signal<string | null>(null);
    isReady = signal(false);

    init(scopes: string[]) {
        this.initScopes = scopes;
        if (this.tokenClient || this.initStarted) return;

        this.initStarted = true;
        this.tryInitTokenClient();
    }

    requestAccessToken() {
        const existing = this.accessToken();
        if (existing) return Promise.resolve(existing);

        // init が script 読み込みより先に走ったケースでも復旧できるようにする
        if (!this.tokenClient && this.initScopes.length) {
            this.init(this.initScopes);
        }
        if (!this.tokenClient) return Promise.reject(new Error('Google auth is not ready'));

        return new Promise<string>((resolve, reject) => {
            const timeoutId = window.setTimeout(() => {
                this.tokenWaiters = this.tokenWaiters.filter(fn => fn !== onSuccess);
                this.tokenErrorWaiters = this.tokenErrorWaiters.filter(fn => fn !== onError);
                reject(new Error('Token request timed out'));
            }, 15000);

            const onSuccess = (token: string) => {
                window.clearTimeout(timeoutId);
                resolve(token);
            };
            const onError = (reason: unknown) => {
                window.clearTimeout(timeoutId);
                reject(reason);
            };

            this.tokenWaiters.push(onSuccess);
            this.tokenErrorWaiters.push(onError);
            this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
    }

    signOut() {
        this.accessToken.set(null);
    }

    private tryInitTokenClient() {
        const google = window.google;
        if (google?.accounts?.oauth2) {
            this.tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: environment.googleClientId,
                scope: this.initScopes.join(' '),
                callback: (resp: any) => {
                    if (resp?.access_token) {
                        this.accessToken.set(resp.access_token);
                        this.resolveTokenWaiters(resp.access_token);
                        return;
                    }
                    this.rejectTokenWaiters(new Error(resp?.error ?? 'Failed to get access token'));
                },
                error_callback: (error: unknown) => {
                    this.rejectTokenWaiters(error);
                },
            });
            this.isReady.set(true);
            this.clearWaitTimer();
            return;
        }

        // gsi script の遅延読み込み待ち
        if (this.waitTimerId == null) {
            this.waitTimerId = window.setInterval(() => this.tryInitTokenClient(), 100);
        }
    }

    private clearWaitTimer() {
        if (this.waitTimerId != null) {
            window.clearInterval(this.waitTimerId);
            this.waitTimerId = null;
        }
    }

    private resolveTokenWaiters(token: string) {
        const waiters = [...this.tokenWaiters];
        this.tokenWaiters = [];
        this.tokenErrorWaiters = [];
        waiters.forEach(resolve => resolve(token));
    }

    private rejectTokenWaiters(reason: unknown) {
        const rejecters = [...this.tokenErrorWaiters];
        this.tokenWaiters = [];
        this.tokenErrorWaiters = [];
        rejecters.forEach(reject => reject(reason));
    }
}
