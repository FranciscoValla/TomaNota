import { Component, computed, inject, input } from '@angular/core';
import { NoteInterface } from '../../../interfaces/note.interface';
import { UtilityServices } from '../../../services/utilitys-services';
import { NoteServices } from '../../../services/note-services';

@Component({
  imports: [],
  selector: 'bin-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class List {
  noteService = inject(NoteServices);
  utilityService = inject(UtilityServices);
  note = input.required<NoteInterface>();

  bgColor = computed( ()=> this.note().color)
  textColor = this.utilityService.getTxtColor(this.bgColor);

  isArray = computed(() => {
    const content = this.note().content;
    return Array.isArray(content); // ✨ Esto devolverá estrictamente true o false
  });

  contentAsArray = computed<{ type: boolean; txt: string }[]>(() => {
    const content = this.note().content;
    return Array.isArray(content) ? (content as { type: boolean; txt: string }[]) : [];
  });

  deleteBin ( note:NoteInterface ) {
    this.noteService.binLocalDelete(note);
  }

  restoredBin ( note:NoteInterface ) {
    this.noteService.createNote(note).subscribe ({
      next: () => this.noteService.binLocalDelete(note),
      error: (err) => console.log('Error: ', err)
    });
  }
}
