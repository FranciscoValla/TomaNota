import { Component, computed, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { Create } from './components/create/create';
import { NoteServices } from '../../services/note-services';
import { NoteInterface } from '../../interfaces/note.interface';
import { List } from './components/list/list';
import { Modal } from './components/modal/modal';
import { UtilityServices } from '../../services/utilitys-services';

@Component({
  imports: [Create, List, Modal],
  selector: 'app-notes',
  styleUrl: './notes.css',
  templateUrl: './notes.html',
})
export class Notes {
  // Inyecciones
  noteService = inject( NoteServices );
  utilityServ = inject ( UtilityServices );

  notes = signal<NoteInterface[]>([]);
  noteModal = signal< NoteInterface | null >( null );

  constructor () {
    this.noteService.fnGetAllNotes();
  }

  notesFix = computed( ()=> {
    return this.noteService._notes().filter((note) => note.fix)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  notesNormal = computed(() => {
    return this.noteService._notes().filter((note) => !note.fix)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  });

  showModal ( note:NoteInterface ) {
    this.noteModal.set(note);
  }
}
