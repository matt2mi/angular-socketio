import {Injectable} from '@angular/core';
import {WebsocketService} from './websocket.service';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ChatService {

  messages: Subject<any>;
  pseudo: string;

  // Our constructor calls our wsService connect method
  constructor(private wsService: WebsocketService) {
  }

  connection(pseudo: string, url: string) {
    return this.messages = <Subject<any>>this.wsService
      .connect(pseudo, url)
      .map((response: any): any => {
        this.pseudo = pseudo;
        return response;
      });
  }

  // Our simplified interface for sending
  // messages back to our socket.io server
  sendLie(answer: string) {
    this.messages.next({pseudo: this.pseudo, value: answer});
  }

  usersReady() {
    this.wsService.usersReady();
  }

  sendAnswer(pseudo: string, answer: any) {
    this.wsService.sendAnswer(pseudo, answer);
  }

  startParty(pseudo: string) {
    this.wsService.startParty(pseudo);
  }

  unStartParty() {
    this.wsService.unStartParty();
  }
}
