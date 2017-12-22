import {Injectable} from '@angular/core';
import {WebsocketService} from './websocket.service';
import {UserService} from './user.service';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class ChatService {

  messages: Subject<any>;

  // Our constructor calls our wsService connect method
  constructor(private wsService: WebsocketService,
              private userService: UserService) {
  }

  connection(pseudo: string, url: string) {
    return this.messages = <Subject<any>>this.wsService
      .connect(pseudo, url)
      .map((response: any): any => {
        this.userService.pseudo = pseudo;
        return response;
      });
  }

  // Our simplified interface for sending
  // messages back to our socket.io server
  sendLie(answer: string) {
    this.messages.next({pseudo: this.userService.pseudo, value: answer});
  }

  usersReady() {
    this.wsService.usersReady();
  }

  sendAnswer(answer: any) {
    this.wsService.sendAnswer(answer);
  }
}
