import { Component, computed, inject } from '@angular/core';
import { NoteServices } from '../../services/note-services';
import { List } from './list/list';
import { Modal } from './modal/modal';

@Component({
  imports: [List],
  selector: 'app-bin',
  styleUrl: './bin.css',
  templateUrl: './bin.html',
})
export class Bin {
  // Inyecciones
  noteService = inject( NoteServices );

}
