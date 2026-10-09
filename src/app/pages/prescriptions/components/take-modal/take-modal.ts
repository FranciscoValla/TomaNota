import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { alertComp, PrescriptionServices } from '../../../../services/prescription-services';
import { DatePipe } from '@angular/common';
import { AlertInterface } from '../../../../interfaces/prescription.interface';
declare var bootstrap: any;

@Component({
  imports: [DatePipe],
  selector: 'presc-take-modal',
  styleUrl: './take-modal.css',
  templateUrl: './take-modal.html',
})
export class TakeModal implements AfterViewInit {
  presService = inject(PrescriptionServices);
  itemInp = input.required<alertComp>();
  closed = output<void>();

  @ViewChild('modalTake') modalRef!: ElementRef;
  private instance: any;

  ngAfterViewInit() {
    this.instance = new bootstrap.Modal(this.modalRef.nativeElement);
    this.instance.show();
    this.modalRef.nativeElement.addEventListener('hide.bs.modal', () => {
      (document.activeElement as HTMLElement)?.blur();
    });
    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.closed.emit();
    });
  }

  bloq(timeApply: string) {
    const dateAply = new Date(timeApply);
    return dateAply.getHours() < 12 ? 'Temprano' : dateAply.getHours() < 17 ? 'Tarde' : 'Noche';
  }

  dateApply(timeApply: string) {
    return new Date(timeApply);
  }

  updatePresc(isTake: boolean) {
    console.log('List:', this.presService._prescList());
    const item = this.itemInp();
    const presc = this.presService._prescList().find((prescItem) => prescItem.id === item.id);
    if (!presc || !presc.alerts) {
      console.warn('No se encontró la receta o sus alertas.');
      return;
    }
    const newAlerts: AlertInterface[] = presc.alerts.map((itemAlert) => {
      if (item.idAlert === itemAlert.idAlert) {
        const nuevoEstado: 'success' | 'fail' | 'pending' = isTake ? 'success' : 'fail';
        return {
          ...itemAlert,
          isApply: nuevoEstado,
        };
      }
      return itemAlert;
    });

    console.log('PRESC: ', presc);
    console.log('newAlerts: ', newAlerts);

    //Enviamos la actualización al servicio (Ahora newAlerts nunca será undefined)
    this.presService.update(item.id, { alerts: newAlerts }).subscribe({
      next: () => this.instance.hide(),
      error: (err) => {
        console.log('Error: ', err);
        this.presService.fnGetAllPresc();
        this.instance.hide();
      }
    })
  }
}
