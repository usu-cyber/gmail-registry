import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { SourceApi } from './core/api/source.api';
import { MockSourceApi } from './core/mocks/source.api.mock';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './core/http/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: SourceApi, useClass: MockSourceApi },
  ],
};
