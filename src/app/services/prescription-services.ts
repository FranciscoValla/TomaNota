import { AlertInterface } from './../interfaces/prescription.interface';
import { HttpClient } from '@angular/common/http';
import { computed, inject, Service, signal } from '@angular/core';
import { environments } from '../environments/environment';
import { PrescriptionInterface } from '../interfaces/prescription.interface';
import { finalize, Observable } from 'rxjs';
import { UtilityServices } from './utilitys-services';
export type alertComp = Omit<PrescriptionInterface, 'alerts'> & AlertInterface;

@Service()
export class PrescriptionServices {
  utilityServ = inject( UtilityServices );
  private http = inject( HttpClient );
  private baseUrl = `${environments.supabaseUrl}/rest/v1/prescriptions`;

  _prescList = signal<PrescriptionInterface[]>([]);

  scheduleToday = computed(() => {
    const dayInit = new Date();
    dayInit.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);
    let schedule: alertComp[] = [];
    for (const presc of this._prescList()) {
      for (const alert of presc.alerts) {
        const timeDate = new Date(alert.timeApply);
        if (timeDate >= dayInit && timeDate <= dayEnd) {
          let bloq =
            timeDate.getHours() < 12 ? 'Mañana' : timeDate.getHours() < 19 ? 'Tarde' : 'Noche';
          schedule.push({
            id: presc.id,
            idAlert: alert.idAlert,
            timeApply: alert.timeApply,
            isApply: alert.isApply,
            name: presc.name,
            apply: presc.apply,
            mg: presc.mg,
            quantity: presc.quantity,
            freqHours: presc.freqHours,
            days: presc.days,
            // id: presc.id,
            // idAlet: alert.idAlert,
            // name: presc.name,
            // apply: `${presc.mg}mg ${presc.quantity} pastillas`,
            // isApply: alert.isApply,
            // dateApply: timeDate, // guarda el Date, no el string
            // bloq: bloq,
          });
        }
      }
    }
    return schedule.sort((a, b) => new Date(a.timeApply).getTime() - new Date(b.timeApply).getTime());
  });

  getAllPresc (): Observable<PrescriptionInterface[]> {
    return this.http.get<PrescriptionInterface[]>(`${this.baseUrl}?select=*`);
  }

  fnGetAllPresc () {
    this.utilityServ.isLoad.set(true)
    this.getAllPresc().pipe(
      finalize ( ()=> this.utilityServ.isLoad.set(false))
    ).subscribe ({
      next: (data) =>  this._prescList.set(data),
      error: (err) => console.log('Error', err)
    });
  }

  createPresc (presc: PrescriptionInterface ):Observable<PrescriptionInterface> {
    return this.http.post<any>(this.baseUrl, presc);
  }

  update ( id:string, presc: Partial<PrescriptionInterface> ): Observable<PrescriptionInterface> {
    return this.http.patch<any>(`${this.baseUrl}?id=eq.${id}`,presc);
  }
}
