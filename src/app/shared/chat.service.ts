import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs/Rx';

@Injectable()
export class ChatService {

    messages: Subject<any>;
    pseudo:string;

    // Our constructor calls our wsService connect method
    constructor(private wsService: WebsocketService) {
    }

    connection(pseudo: string) {
        console.log(pseudo);
        return this.messages = <Subject<any>>this.wsService
            .connect(pseudo)
            .map((response: any): any => {
                console.log(pseudo);
                this.pseudo = pseudo;
                return response;
            });
    }

    // Our simplified interface for sending
    // messages back to our socket.io server
    sendMsg(message: string) {
        this.messages.next({pseudo: this.pseudo, message});
    }

}
