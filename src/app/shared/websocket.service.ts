import {Injectable} from '@angular/core';
import * as io from 'socket.io-client';
import {Observable} from 'rxjs/Observable';
import * as Rx from 'rxjs/Rx';
import {environment} from '../../environments/environment';

@Injectable()
export class WebsocketService {

  // Our socket connection
  private socket;

  constructor() {
  }

  connect(pseudo: string): Rx.Subject<MessageEvent> {
    // If you aren't familiar with environment variables then
    // you can hard code `environment.ws_url` as `http://localhost:5000`
    this.socket = io(environment.ws_url);

    // We define our observable which will observe any incoming messages
    // from our socket.io server.
    const observable = new Observable(serverDataObserver => {
      this.socket.on('message', data => serverDataObserver.next(data));
      this.socket.on('new-user', data => serverDataObserver.next(data));
      this.socket.on('user-out', data => serverDataObserver.next(data));
      this.socket.on('question', data => serverDataObserver.next(data));
      this.socket.on('answers', data => serverDataObserver.next(data));
      return () => this.socket.disconnect();
    });

    // We define our Observer which will listen to messages
    // from our other components and send messages back to our
    // socket server whenever the `next()` method is called.
    const newMessageObserver = {
      next: (data: Object) => this.socket.emit('answer', data)
    };

    this.socket.emit('new-user', JSON.stringify(pseudo));

    // we return our Rx.Subject which is a combination
    // of both an observer and observable.
    return Rx.Subject.create(newMessageObserver, observable);
  }

  usersReady() {
    this.socket.emit('users-ready');
  }

  sendLieChoosen(lie: any) {
    this.socket.emit('lie-choosen', lie);
  }
}
