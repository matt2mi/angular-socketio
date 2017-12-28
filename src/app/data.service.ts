import {Injectable, OnInit} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class DataService implements OnInit {

  private pseudoSubject = new Subject<any>();

  constructor() {
  }

  ngOnInit() {
  }

  setPseudo(message: string) {
    this.pseudoSubject.next({text: message});
  }

  getPseudo(): Observable<any> {
    return this.pseudoSubject.asObservable();
  }
}
