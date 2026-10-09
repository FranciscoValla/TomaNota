export interface PrescriptionInterface {
  id: string;
  name: string;
  apply: string;
  mg: number;
  quantity: number;
  freqHours: number;
  days: number;
  notes?: string;
  alerts: AlertInterface[];
}

export interface AlertInterface {
  idAlert: string;
  timeApply: string;
  isApply: 'success' | 'pending' | 'fail';
}
