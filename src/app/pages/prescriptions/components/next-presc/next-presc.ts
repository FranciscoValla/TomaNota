import { Component, computed, inject } from '@angular/core';
import { PrescriptionServices } from '../../../../services/prescription-services';
import { toSignal } from '@angular/core/rxjs-interop';
import { interval, map } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  imports: [],
  selector: 'presc-next-presc',
  styleUrl: './next-presc.css',
  templateUrl: './next-presc.html',
})
export class NextPresc {
  prescService = inject(PrescriptionServices);

  private now = toSignal(interval(1000).pipe(map(() => new Date())), { initialValue: new Date() });

  nextPresc = computed(() => {
    const referenceTime = new Date().getTime();
    const todayAlerts = this.prescService.scheduleToday() || [];

    const nextToday = todayAlerts.find((item) => {
      return item.isApply === 'pending' && new Date(item.timeApply).getTime() > referenceTime;
    });

    if (nextToday) {
      return {
        id: nextToday.id,
        idAlert: nextToday.idAlert,
        name: nextToday.name || 'Medicamento',
        // Aseguramos que tenga el string formateado para el HTML
        apply: nextToday.apply || `${nextToday.mg || 0}mg • ${nextToday.quantity || 0} pastillas`,
        dateApply: new Date(nextToday.timeApply),
      };
    }

    // --- PASO 2: Si no hay nada hoy, buscar la más cercana en TODAS las recetas ---
    console.log('No hay más tomas hoy. Buscando en el historial completo...');
    let nextFutureAlert: any = null;
    let minFutureTime = Infinity;
    const allPrescriptions = this.prescService._prescList() || [];

    for (const presc of allPrescriptions) {
      if (!presc.alerts) continue;
      for (const alert of presc.alerts) {
        if (alert.isApply !== 'pending') continue;
        const alertTime = new Date(alert.timeApply).getTime();
        if (alertTime > referenceTime && alertTime < minFutureTime) {
          minFutureTime = alertTime;
          nextFutureAlert = {
            id: presc.id,
            idAlert: alert.idAlert,
            name: presc.name,
            apply: `${presc.mg}mg • ${presc.quantity} pastillas`,
            dateApply: new Date(alert.timeApply),
          };
        }
      }
    }
    return nextFutureAlert; // Retorna el objeto encontrado o null si no hay absolutamente nada
  });

  countdown = computed(() => {
    const pill = this.nextPresc();
    if (!pill) return null;
    const diffMs = pill.dateApply.getTime() - this.now().getTime();
    if (diffMs <= 0) return '¡Ahora!';
    const totalSec = Math.floor(diffMs / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  });

  isTake = computed(() => {
    const hour = this.countdown()?.slice(-8, -6);
    const min = this.countdown()?.slice(-5, -3);
    let result = false;
    if ( Number(hour) === 0) {
      if (Number(min) <= 15) {
      result = true;
      }
    }
    return result;
  });
}
