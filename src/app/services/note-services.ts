import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { environments } from '../environments/environment';
import { NoteInterface } from '../interfaces/note.interface';
import { finalize, Observable } from 'rxjs';
import { UtilityServices } from './utilitys-services';

@Service()
export class NoteServices {
  private http = inject(HttpClient);
  utilityServ = inject( UtilityServices );
  private anonKey = environments.superbaseAnonKey;
  private baseUrl = `${environments.supabaseUrl}/rest/v1/notes`;
  private headersUrl = new HttpHeaders({
    'apikey': this.anonKey,
    'Authorization': `Bearer ${this.anonKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  });

  _notes = signal<NoteInterface[]>([]);
  _bins = signal<NoteInterface[]>( this.binLocalGet());

  getAllNotes (): Observable<NoteInterface[]>{
    return this.http.get<any[]>(`${this.baseUrl}?select=*`, {
      headers: this.headersUrl
    });
  }

  fnGetAllNotes() {
    this.utilityServ.isLoad.set(true);
    this.getAllNotes().pipe(
        finalize(() => this.utilityServ.isLoad.set(false))
      ).subscribe({
      next: (data) => {
        this._notes.set(data);
      },
      error: (error) => console.log('>>> error: ', error)
    });
  }

  createNote ( note:NoteInterface ): Observable<NoteInterface> {
    return this.http.post<any>(this.baseUrl, note, {
      headers: this.headersUrl
    });
  }

  update ( id:string, note:Partial<NoteInterface>): Observable<NoteInterface> {
    return this.http.patch<any>( `${this.baseUrl}?id=eq.${id}`,note, {
      headers: this.headersUrl
    });
  }

  delete ( id:any): Observable<any> {
    return this.http.delete(`${this.baseUrl}?id=eq.${id}`, {
      headers: this.headersUrl
    });
  }


  binLocalCreate ( bin: NoteInterface ) {
    this._bins.update(list => [...list, bin]);
  localStorage.setItem('binLocal', JSON.stringify(this._bins()));
  }

  binLocalGet ( ): NoteInterface[] {
    try {
      const raw = localStorage.getItem('binLocal');
      if (!raw || raw === 'undefined') {
        localStorage.removeItem('binLocal');
        return [];
      }
      const parseRaw = JSON.parse(raw);
      return  Array.isArray( parseRaw ) ? parseRaw : [];
    } catch (error) {
      console.log('Error en binLocal', error);
      localStorage.removeItem('binLocal');
      return [];
    }
  }

  binLocalDelete ( bin:NoteInterface ) {
    this._bins.update ( list => list.filter ( item => item.id !== bin.id ));
    localStorage.setItem('binLocal', JSON.stringify(this._bins));
  }
}
