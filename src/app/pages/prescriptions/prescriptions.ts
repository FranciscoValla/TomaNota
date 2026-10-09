import { alertComp } from './../../services/prescription-services';
import { Component, computed, inject, Pipe, signal } from '@angular/core';
import { CreateModal } from './components/create-modal/create-modal';
import { ScheduleList } from './components/schedule-list/schedule-list';
import { NextPresc } from './components/next-presc/next-presc';
import { TakeModal } from './components/take-modal/take-modal';

@Component({
  imports: [CreateModal, ScheduleList, NextPresc],
  selector: 'app-prescriptions',
  styleUrl: './prescriptions.css',
  templateUrl: './prescriptions.html',
})
export class Prescriptions {

}
