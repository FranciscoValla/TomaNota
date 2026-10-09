import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { UtilityServices } from './services/utilitys-services';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  utilityService = inject( UtilityServices );
  protected readonly title = signal('TomaNota');

  isHidden = signal(false);
  lastScroll = 0;

  @HostListener('window:scroll')
  onScroll() {
    if (window.innerWidth >= 768) {
      this.isHidden.set(false);
      return;
    }
    const curr = window.scrollY;
    if (curr > this.lastScroll && curr > 60) {
      this.isHidden.set(true);
    } else {
      this.isHidden.set(false);
    }
    this.lastScroll = curr;
  }
}
