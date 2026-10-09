import { UtilityServices } from './../../../../services/utilitys-services';
import { AfterViewInit, Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { form, FormField, minLength, required } from '@angular/forms/signals';
import { AlertInterface, PrescriptionInterface } from '../../../../interfaces/prescription.interface';
import { PrescriptionServices } from '../../../../services/prescription-services';
declare var bootstrap: any;

interface ViaAdministracion {
  nombre: string;
  icono: string;
}

@Component({
  imports: [FormField],
  selector: 'presc-create-modal',
  styleUrl: './create-modal.css',
  templateUrl: './create-modal.html',
})
export class CreateModal implements AfterViewInit {

  //inyecciones
  prescService = inject( PrescriptionServices );
  utilityServ = inject( UtilityServices );

  @ViewChild('modalCreatePres') modalRef!: ElementRef;
  private instance: any;

  viasAdministracion = signal<ViaAdministracion[]>([
    { nombre: 'Vía Oral (Pastillas, Jarabes)', icono: 'fa-solid fa-capsules' },
    { nombre: 'Vía Inyectable', icono: 'fa-solid fa-syringe' },
    { nombre: 'Vía Tópica (Cremas, Pomadas)', icono: 'fa-solid fa-pump-medical' },
    { nombre: 'Vía Inhalatoria / Respiratoria', icono: 'fa-solid fa-lungs' },
    { nombre: 'Vía Oftálmica / Ótica (Gotas)', icono: 'fa-solid fa-droplet' },
    { nombre: 'Otras vías', icono: 'fa-solid fa-prescription-bottle-medical' }
  ]);
  frecuencia = signal ([4,6,8,12,24]);
  duracion = signal([2,3,4,5,6,10,15,30,0]);
  iconVia = computed( ()=>{
    let applyI = {
      icon: '',
      name: ''
    }
    switch (this.model().apply) {
      case 'Vía Oral (Pastillas, Jarabes)':
        applyI = {
          icon: 'fa-solid fa-capsules',
          name: 'pastillas',
        }
        break;
      case 'Vía Inyectable':
        applyI = {
          icon: 'fa-solid fa-syringe',
          name: 'Inyecciones',
        }
        break;
      case 'Vía Tópica (Cremas, Pomadas)':
        applyI = {
          icon: 'fa-solid fa-pump-medical',
          name: 'Aplicación',
        }
        break;
      case 'Vía Inhalatoria / Respiratoria':
        applyI = {
          icon: 'fa-solid fa-lungs',
          name: 'Spray',
        }
        break;
      case 'Vía Oftálmica / Ótica (Gotas)':
        applyI = {
          icon: 'fa-solid fa-droplet',
          name: 'Gotas',
        }
        break;
      case 'Otras vías':
        applyI = {
          icon: 'fa-solid fa-prescription-bottle-medical',
          name: 'Otros',
        }
        break;
      default:
        applyI = {
          icon: 'fa-solid fa-capsules',
          name: 'Pastillas',
        }
        break;
    }
    return applyI;
  });
  // --- --- Validacion --- ---
  model = signal({
    name: '',
    apply: this.viasAdministracion()[0].nombre,
    mg: '',
    quantity: '',
    freqHours: this.frecuencia()[2].toString(),
    days: this.duracion()[0].toString(),
    notes: '',
  });

  alertForm = form(this.model, (f)=>{
    required(f.name, {message: 'Nombre medicamento obligatorio'});
    minLength(f.name, 3);
    required(f.apply, {message: 'Via aministración obligatorio'});
    required(f.mg, {message: 'Dosis obligatorio'});
    minLength(f.mg, 1);
    required(f.quantity, {message: 'Cant. pastillas obligatorio'});
    minLength(f.quantity, 1);
    required(f.freqHours, {message: 'Frecuencia obligatorio'});
    required(f.days, {message: 'Duración obligatorio'});
  });

  isValid = computed(()=> this.alertForm().valid());

  ngAfterViewInit() {
      this.instance = new bootstrap.Modal(this.modalRef.nativeElement);
      this.modalRef.nativeElement.addEventListener('hide.bs.modal', () => {
        (document.activeElement as HTMLElement)?.blur();
      });
      this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      });
    }

  createAlert ( freqHours:number, days:number, init:Date ):AlertInterface[] {
    const effectiveDays = days === 0 ? 30 : days;
    const totalHrs = 24 * effectiveDays;
    const totalAlerts = Math.floor(totalHrs/freqHours);
    const alerts: AlertInterface[] = [];
    for ( let i= 0; i<totalAlerts; i++ ) {
      const dateAlert = new Date(init.getTime() + i * freqHours * 60 * 60 * 1000);
      alerts.push({
        idAlert: crypto.randomUUID().slice(0,8),
        isApply: 'pending',
        timeApply: dateAlert.toISOString(),
      });
    }
    return alerts;
  }

  savePresc () {
    if( !this.isValid()) {
      this.alertForm().markAsTouched();
      return;
    } else {
      const init15 = new Date(Date.now() + 15*60*1000); //Inicio 15 depsues
      const mgNumb = Number(this.model().mg);
      const quantityNumb = Number(this.model().quantity);
      const freqHoursNumb = Number(this.model().freqHours);
      const daysNumb = Number(this.model().days);

      const prescription: PrescriptionInterface = {
        id: crypto.randomUUID().slice(0,8),
        name: this.model().name,
        apply: this.model().apply,
        mg: mgNumb,
        quantity: quantityNumb,
        freqHours: freqHoursNumb,
        days: daysNumb,
        alerts: this.createAlert(freqHoursNumb, daysNumb, init15),
      };
      this.prescService.createPresc(prescription).subscribe({
        next: () => {
          this.prescService.fnGetAllPresc();
          this.instance.hide()
        },
        error: (err) => {
          console.log('Error: ', err);
          this.instance.hide();
        }
      });
    }
  }


}
