import { NgClass } from '@angular/common';
import { Component, computed, ElementRef, HostListener, inject, signal, viewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ImgCompress } from '../../../../services/img-compress';
import { NoteServices } from '../../../../services/note-services';
import { NoteInterface } from '../../../../interfaces/note.interface';
import { finalize } from 'rxjs';
import { UtilityServices } from '../../../../services/utilitys-services';
import { SelectColor } from '../../../../shareds/atoms/select-color/select-color';

@Component({
  imports: [FormsModule, NgClass, SelectColor],
  selector: 'note-create',
  styleUrl: './create.css',
  templateUrl: './create.html',
})
export class Create {

  //injects
  imgCompress = inject( ImgCompress );
  utilityService = inject( UtilityServices );
  noteService = inject( NoteServices );
  private elementRef = inject( ElementRef );

  title = signal('');
  content = signal('');
  fix = signal(false);
  bgColor = signal('bg-white');
  textColor = this.utilityService.getTxtColor(this.bgColor);

  isExpanded = signal(false);
  isList = signal(false);
  listNote = signal<{ type: boolean; txt: string }[]>([]);
  showListButton = signal(true);
  elementosInput = viewChildren<ElementRef<HTMLInputElement>>('notaInput');
  isShowSelectColor = signal(false);

  imagenUrl = signal<string | null>(null);

  @HostListener('document:click', ['$event'])
  onClickOutside( event: MouseEvent ) {
    const clickedInside = this.elementRef.nativeElement.contains(event.target);
    if (!clickedInside) {
      if (this.title().trim().length === 0 && this.content().trim().length === 0) {
        this.isExpanded.set(false);
        this.fix.set(false);
        this.imagenUrl.set(null);
        this.isList.set(false);
        this.listNote.set([]);
        this.showListButton.set(true);
      } else {
      this.createNote();
    }
    this.bgColor.set('bg-white');
    }
  }

  createList () {
    this.isList.set(true);
    this.showListButton.set(true);
    this.listNote.set([{ type: true, txt: '' }]);
    this.isExpanded.set(true);
    setTimeout( () => {
      this.elementosInput()[0]?.nativeElement.focus();
    },10);
  }

  onEnter( event: Event, index:number, add = false ) {
    event.preventDefault();
    let insertAt = 0;
    this.listNote.update ( (list) => {
      const copy = [...list];
      if ( add ) {
        insertAt = copy.length
        copy.push({type: true, txt: ''});
      } else {
        insertAt = index + 1;
        copy.splice( insertAt, 0, { type:true, txt: ''});
      }
      return copy
    });
    setTimeout(() => {
      this.elementosInput()[insertAt]?.nativeElement.focus();
    }, 10);
  }

  deleteliList(indexDelete: number) {
    if (this.listNote().length > 1) {
      this.listNote.update((li) => li.filter((_item, index) => index !== indexDelete));
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const imageCompressBase64 = await this.imgCompress.compressFile(file, 1200, 0.4);
        this.imagenUrl.set(imageCompressBase64);
      } catch {
        // this.alertService.showAlert({
        //   type: 'bg-danger-subtle',
        //   txt: 'Error al guardar la imagen.',
        // });
      }
    }
  }

  createNote() {
    let contenTemp: any;
    let contenIsTemp: boolean;
    if (this.isList()) {
      contenTemp = this.listNote();
      let isClean = this.listNote().filter( item => item.txt !== '');
      if(this.listNote().length === 0) contenIsTemp = false;
      contenIsTemp = false ? this.listNote().length === 0 : true;
    } else {
      contenTemp = this.content();
      contenIsTemp = false ? contenTemp.length === 0 : true;
    }
    if (this.title().trim().length === 0 && contenIsTemp === false && this.imagenUrl() === null) {
      this.isExpanded.set(false);
      this.fix.set(false);
      this.bgColor.set('bg-white');
      this.imagenUrl.set(null);
      this.isList.set(false);
      this.listNote.set([]);
      this.showListButton.set(true);
      // this.alertService.showAlert({
      //   type: 'bg-warning-subtle',
      //   txt: 'Nota vacía. No se creó la Nota.',
      // });
    } else {
      // this.loadSignal.emit(true);
      const newNote: NoteInterface = {
        id: crypto.randomUUID(),
        title: this.title(),
        content: contenTemp,
        fix: this.fix(),
        color: this.bgColor(),
        img: this.imagenUrl(),
        date: new Date(),
      };
      this.noteService.createNote(newNote).pipe(
        finalize( () => {
          this.isExpanded.set(false);
          this.title.set('');
          this.content.set('');
          this.fix.set(false);
          this.imagenUrl.set(null);
          this.bgColor.set('bg-white');
          this.isList.set(false);
          this.listNote.set([]);
          this.showListButton.set(true);
        })
      ).subscribe({
        next: () => {
          this.noteService.fnGetAllNotes();
        },
        error: (err) => {
          // this.alertService.showAlert({
          //   type: 'bg-danger-subtle',
          //   txt: 'Error al guardar la Nota. No se creó la Nota.',
          // });
          console.log('>>> Error', err);
        }
      });
    }
  }

}
