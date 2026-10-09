import { computed, Service, signal, Signal } from "@angular/core";

@Service()
export class UtilityServices {

  isLoad = signal(false);
  getTxtColor (bgColor:Signal<string>) {
    return computed ( () => {
      switch (bgColor()) {
        case 'bg-primary':
        case 'bg-secondary':
        case 'bg-success':
        case 'bg-danger':
        case 'bg-dark':
          return 'text-white';

        case 'bg-white':
        case 'bg-warning':
        case 'bg-info':
        default:
          return 'text-success-emphasis';
      }
    });
  }
}
