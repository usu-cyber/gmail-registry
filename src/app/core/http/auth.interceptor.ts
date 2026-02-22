import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { GoogleAuthService } from '../services/google-auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(GoogleAuthService);
    const token = auth.accessToken();

    // Gmail API だけに付ける（他のAPIに漏らさない）
    const isGmailApi = req.url.startsWith('https://gmail.googleapis.com/');
    if (token && isGmailApi) {
        req = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` },
        });
    }
    return next(req);
};
