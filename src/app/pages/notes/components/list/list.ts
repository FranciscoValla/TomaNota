import { UtilityServices } from './../../../../services/utilitys-services';
import { Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { NoteInterface } from '../../../../interfaces/note.interface';
import { NgClass } from '@angular/common';
import { not } from 'rxjs/internal/util/not';
import { SelectColor } from '../../../../shareds/atoms/select-color/select-color';
import { ImgCompress } from '../../../../services/img-compress';
import { NoteServices } from '../../../../services/note-services';

@Component({
  imports: [NgClass,SelectColor],
  selector: 'note-list',
  styleUrl: './list.css',
  templateUrl: './list.html',
})
export class List {
  // Inyecciones
  noteService = inject( NoteServices );
  utilityService = inject( UtilityServices );
  imgCompress = inject( ImgCompress );

  note = input.required<NoteInterface>();
  openModalEmit = output<NoteInterface>();

  bgColor = computed( ()=> this.note().color)
  textColor = this.utilityService.getTxtColor(this.bgColor);

  isShowSelectColor = signal(false);

  isArray = computed(() => {
    const content = this.note().content;
    return Array.isArray(content); // ✨ Esto devolverá estrictamente true o false
  });

  contentAsArray = computed<{ type: boolean; txt: string }[]>(() => {
    const content = this.note().content;
    return Array.isArray(content) ? (content as { type: boolean; txt: string }[]) : [];
  });

  changeState( indexTarget:number) {
    const currentList = Array.isArray( this.note().content ) ?
    (this.note().content as { type: boolean, txt: string}[] ) : [];
    const newList = currentList.map( (item, index) => {
      if ( index === indexTarget ){
        return { ...item, type: !item.type}
      }
      return item;
    });
    this.noteService.update( this.note().id, {content: newList} ).subscribe ({
      next: () => {
        this.noteService.fnGetAllNotes();
      },
      error: (err) => console.log('Error', err)
    });
    // const contenidoActual = Array.isArray(this.note().content)
    //   ? (this.note().content as { type: boolean; txt: string }[])
    //   : [];
    // const nuevoContenido = contenidoActual.map((item, index) => {
    //   if (index === indexTarget) {
    //     return { ...item, type: !item.type };
    //   }
    //   return item;
    // });
    // this.noteServices.updateNoteFireStore(this.note().id, { content: nuevoContenido }).subscribe({
    //   next: () => {
    //     this.refreshNotes('bg-success', 'Estado de la tarea actualizado.');
    //   },
    //   error: () => {
    //     this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al cambiar estado de la tarea.'});
    //   }
    // });
  }

  updateNoteFix() {
    const currentNote = linkedSignal( () => ({...this.note()}))
    // currentNote.update((current) => ({
    //   ...current,
    //   fix: !current.fix,
    // }));
    this.noteService.update(currentNote().id, {fix: !currentNote().fix}).subscribe ({
      next: () => this.noteService.fnGetAllNotes(),
      error: (err) => console.log('Error',err)
    });
    // this.updateOutput.emit(this.noteCurrent());
    // if ( this.isList() ){
    //   this.noteServices.updateNoteFireStore(this.noteCurrent().id, { fix: this.noteCurrent().fix }).subscribe({
    //     next: () => this.refresOutput.emit({type:'bg-success-subtle', txt:'Se cambio Fijo/Normal.'}),
    //     error: () =>
    //       this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Fijar/Normal.'})
    //   });
    // }
  }

  updateColor( colorUpd:string ) {
    const currentNote = linkedSignal( () => ({...this.note()}))
    // currentNote.update((current) => ({
    //   ...current,
    //   color: color,
    // }));
    this.noteService.update(currentNote().id,{color: colorUpd}).subscribe({
      next: () => {
        this.noteService.fnGetAllNotes();
      },
      error: (err) => console.log('Error', err)
    });
    // this.updateOutput.emit(this.noteCurrent());
    // if ( this.isList() ){
    //   this.noteServices.updateNoteFireStore(this.noteCurrent().id, { fix: this.noteCurrent().fix }).subscribe({
    //     next: () => this.refresOutput.emit({type:'bg-success-subtle', txt:'Se cambio Fijo/Normal.'}),
    //     error: () =>
    //       this.alerService.showAlert({type:'bg-danger-subtle', txt:'Error al Fijar/Normal.'})
    //   });
    // }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const imageCompressBase64 = await this.imgCompress.compressFile(file, 1200, 0.4);
        // this.imagenUrl.set(imageCompressBase64);
        const currentNote = linkedSignal( () => ({...this.note()}));
        // currentNote.update( (current)=> ({
        //   ...current, img: imageCompressBase64
        // }));
        this.noteService.update( currentNote().id, {img: imageCompressBase64}).subscribe ({
          next: () => {
            this.noteService.fnGetAllNotes();
          },
          error: (err) => console.log('Error', err)
        });
      } catch {
        // this.alertService.showAlert({
        //   type: 'bg-danger-subtle',
        //   txt: 'Error al guardar la imagen.',
        // });
      }
    }
  }

  deleteNote ( id:any, note:NoteInterface ) {
    this.noteService.delete(id).subscribe({
      next: () => {
        this.noteService.fnGetAllNotes();
        this.noteService.binLocalCreate(note);
      },
      error: (err) => console.log('Error', err)
    });
  }

}
