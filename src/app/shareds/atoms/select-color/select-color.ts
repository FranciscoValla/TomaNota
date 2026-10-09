import { Component, ElementRef, HostListener, inject, input, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'atom-select-color',
  styleUrl: './select-color.css',
  templateUrl: './select-color.html',
})
export class SelectColor {
  private elementRef = inject(ElementRef);
  colorInput = input.required<string>();
  isModal = input<boolean>(false);
  colorSelected = output<string>();
  hideSelect = output();

  listadoColores = signal([
    { bg: 'bg-white', text: 'text-dark', border: 'border border-dark' },
    { bg: 'bg-primary', text: 'text-white', border: '' },
    { bg: 'bg-secondary', text: 'text-white', border: '' },
    { bg: 'bg-success', text: 'text-white', border: '' },
    { bg: 'bg-danger', text: 'text-white', border: '' },
    { bg: 'bg-warning', text: 'text-dark', border: '' },
    { bg: 'bg-info', text: 'text-dark', border: '' },
    { bg: 'bg-dark', text: 'text-white', border: '' }
  ]);

  @HostListener('window:click', ['$event'])
  onClickOutside( event:MouseEvent ) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      this.hideSelect.emit();
    }
  }
}
