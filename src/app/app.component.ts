import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GoogleAuthService } from './core/services/google-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet />`,
})
export class AppComponent {
  private auth = inject(GoogleAuthService);

  ngOnInit() {
    this.auth.init(['https://www.googleapis.com/auth/gmail.readonly']);
  }
}
