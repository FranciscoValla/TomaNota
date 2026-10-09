import { Component, computed, inject, input, output, signal } from '@angular/core';
import { PrescriptionInterface } from '../../../../interfaces/prescription.interface';
import { alertComp, PrescriptionServices } from '../../../../services/prescription-services';
import { DatePipe } from '@angular/common';
import { TakeModal } from '../take-modal/take-modal';

@Component({
  imports: [DatePipe, TakeModal],
  selector: 'presc-schedule-list',
  styleUrl: './schedule-list.css',
  templateUrl: './schedule-list.html',
})
export class ScheduleList {
  prescService = inject( PrescriptionServices );
  takeObj = signal<alertComp | null>(null);

  constructor () {
    this.prescService.fnGetAllPresc();
  }

  showModal (item: alertComp) {
    if ( item.isApply === 'pending' && this.isVencido(this.dateApply(item.timeApply)) ) {
      this.takeObj.set(item);
    }
  }

  bgColor (isApply:string, fechaIso:string ) {
    switch(isApply){
      case 'success' :
        return 'bg-success-subtle';
      case 'fail' :
        return 'bg-danger-subtle';
      // case 'pending' :
      //   return 'bg-warning-subtle border border-warning';
      default :
      const dateTime = this.dateApply(fechaIso);
      if ( this.isVencido(dateTime) ) {
        return 'bg-warning-subtle';
      } else {
        return 'bg-primary-subtle';
      }
    }
  }

  bloq (timeApply:string, )  {
    const dateAply = new Date( timeApply );
    return dateAply.getHours() < 12 ? 'Mañana': dateAply.getHours() < 17 ? 'Tard' : 'Noche'
  }

  dateApply ( timeApply:string ) {
    return new Date(timeApply);
  }

  isVencido(fechaISO: Date): boolean {
    return new Date(fechaISO).getTime() < Date.now();
  }

}
