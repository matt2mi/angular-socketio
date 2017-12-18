import { Component, OnInit } from '@angular/core';
import { ChatService } from './shared/chat.service';

interface Message {type: string, text: string
}
;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    title = 'app';
    messages:Message[] = new Array<Message>();
    currentAnswer:string;
    pseudo:string;

    constructor(private chat:ChatService) {
    }

    ngOnInit() {
    }

    signUp() {
        this.chat
            .connection(this.pseudo);
        this.chat.messages.subscribe(msg => {
                console.log(msg);
                if (msg.type === 'new-user') {
                    msg.value = {message: 'New user connected : ' + msg.pseudo, pseudo: ''};
                }
                this.messages.push(msg);
            },
                error => console.log(error));
    }

    sendMessage() {
        this.chat.sendMsg(this.currentAnswer);
    }
}
