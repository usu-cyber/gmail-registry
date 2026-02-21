import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { SourceApi } from './core/api/source.api';
import { MockSourceApi } from './core/mocks/source.api.mock';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    { provide: SourceApi, useClass: MockSourceApi },
  ],
};
