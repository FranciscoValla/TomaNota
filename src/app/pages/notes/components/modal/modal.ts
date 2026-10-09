import { AfterViewInit, Component, computed, effect, ElementRef, inject, input, linkedSignal, OnDestroy, output, signal, ViewChild, viewChildren } from '@angular/core';
import { NoteInterface } from '../../../../interfaces/note.interface';
import { UtilityServices } from '../../../../services/utilitys-services';
import { ImgCompress } from '../../../../services/img-compress';
import { NgClass } from '@angular/common';
import { SelectColor } from '../../../../shareds/atoms/select-color/select-color';
import { FormsModule } from '@angular/forms';
import { NoteServices } from '../../../../services/note-services';
import { debounceTime, distinctUntilChanged, Subject, switchMap, takeUntil } from 'rxjs';
declare var bootstrap: any;

@Component({
  imports: [NgClass, SelectColor, FormsModule  ],
  selector: 'note-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal implements AfterViewInit, OnDestroy{
  utilityService = inject( UtilityServices );
  imgCompress = inject( ImgCompress );
  noteService = inject( NoteServices );
  noteInput = input.required<NoteInterface>();
  noteCurrent = linkedSignal ({
    source: () => this.noteInput().id,
    computation: () => structuredClone( this.noteInput())
  });
  closed = output<void>();

  bgColor = computed( ()=> this.noteCurrent().color)
  textColor = this.utilityService.getTxtColor(this.bgColor);
  isShowSelectColor = signal(false);

  @ViewChild('modalRef') modalRef!: ElementRef;
  private instance: any;

  private noteUpdate$ = new Subject<{ field: 'title' | 'content'; value: string | any }>();
  private destroy$ = new Subject<void>();
  isList = computed( ()=> Array.isArray(this.noteCurrent().content) );
  contentArray = linkedSignal<{ type: boolean; txt: string }[]>( ()=> {
    return Array.isArray(this.noteCurrent().content) ? (this.noteCurrent().content as {type: boolean; txt:string}[]): [];
  });
  elementosInput = viewChildren<ElementRef<HTMLInputElement>>('notaInput');

  constructor() {
    effect(() => {
      if (this.noteInput()) {
        this.show();
      }
    });

    this.noteUpdate$.pipe(
      debounceTime(600),
      switchMap( (cambio) => {
        const payload = { [cambio.field]: cambio.value };
        return this.noteService.update(this.noteCurrent().id, payload);
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: () => this.noteService.fnGetAllNotes(),
      error: (err) => console.log('Error',err)
    });
  }

  ngAfterViewInit() {
    this.instance = new bootstrap.Modal(this.modalRef.nativeElement);
    this.instance.show();

    // 1. Antes de que se empiece a cerrar, le quitamos el foco a lo que sea
    this.modalRef.nativeElement.addEventListener('hide.bs.modal', () => {
      (document.activeElement as HTMLElement)?.blur();
    });

    // 2. Cuando ya se cerró, avisamos al padre para destruirlo
    this.modalRef.nativeElement.addEventListener('hidden.bs.modal', () => {
      this.closed.emit();
    });
  }

  ngOnDestroy(): void {
    this.instance.hide();
    this.destroy$.next();
    this.destroy$.complete();
    this.noteUpdate$.complete();
  }

  updateNoteFix() {
    const fixCurrent = !this.noteCurrent().fix;
    this.noteService.update(this.noteCurrent().id, {fix: fixCurrent}).subscribe ({
      next: () => {
        this.noteCurrent.update( list => ({
          ...list, fix: fixCurrent
        }));
        this.noteService.fnGetAllNotes();
        },
      error: (err) => console.log('Error',err)
    });
  }

  updateColor( colorUpd:string ) {
    this.noteService.update(this.noteCurrent().id,{color: colorUpd}).subscribe({
      next: () => {
        this.noteCurrent.update( list => ({
          ...list, color: colorUpd
        }));
        this.noteService.fnGetAllNotes();
      },
      error: (err) => console.log('Error', err)
    });
  }

  updateTitle ( event:Event ) {
    const target = event.target as HTMLTextAreaElement;
    const txt = target.value;
    this.noteCurrent.update(nota => ({ ...nota, title: txt }));
    this.noteUpdate$.next({ field:'title', value:txt });
  }

  onEnter(event: Event, index:number, add = false) {
    event.preventDefault();
    let insertAt = 0;
    this.contentArray.update( (list) => {
      const copy = [...list];
      if ( add ) {
        insertAt = copy.length;
        copy.push({ type:true, txt: '' });
      } else {
        insertAt = index + 1;
        copy.splice( insertAt, 0, { type: true, txt:'' })
      }
      return copy
    })
    this.noteCurrent.update( list => ({
      ...list, content: this.contentArray()
    }));
    this.noteUpdate$.next({field: 'content', value: this.contentArray()});
    setTimeout(() => {
      this.elementosInput()[insertAt]?.nativeElement.focus();
    }, 10);
  }

  updateList () {
    this.noteCurrent.update( list => ({
      ...list, content: this.contentArray()
    }));
    this.noteUpdate$.next({ field: 'content', value: this.contentArray() });
  }

  deleteList(indexDelete:number){
    if ( this.contentArray().length > 1) {
      this.contentArray.update( (list)=> list.filter( (_item, index) => index !== indexDelete));
    }
    this.noteCurrent.update( note => ({ ...note, content: this.contentArray() }));
    console.log('Content: ', this.noteCurrent().content);
    this.noteUpdate$.next({ field: 'content', value:this.contentArray() });
    // this.noteCurrent.update( list => ({
    //   ...list, content: this.contentArray()
    // }));
  }

  updateContent () {
    let contentTemp: any;
    if ( this.contentArray().length < 0 ) {
      contentTemp = this.contentArray();
    } else {
      contentTemp = this.noteCurrent().content;
    }
    this.noteCurrent.update(note => ({ ...note, content: contentTemp }));
    this.noteUpdate$.next({ field: 'content', value:contentTemp });
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const imageCompressBase64 = await this.imgCompress.compressFile(file, 1200, 0.4);
        this.noteService.update( this.noteCurrent().id, {img: imageCompressBase64}).subscribe ({
          next: () => {
            this.noteCurrent.update( list => ({
              ...list, img: imageCompressBase64
            }));
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

  deleteNote ( id:any ) {
    this.noteService.delete(id).subscribe({
      next: () => {
        this.instance.hide();
        this.noteService.fnGetAllNotes();
      },
      error: (err) => console.log('Error', err)
    });
  }

  show() {
    this.instance?.show();
  }
}
