import {Component, OnInit} from '@angular/core';
import {ChatService} from './shared/chat.service';
import {UserService} from './shared/user.service';

interface Message {
  type: string;
  value: {
    pseudo: string,
    message: string
  };
  nbUsers: number;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  messages: Message[] = [];
  currentAnswer: string;
  pseudo: string;
  nbMaxUsers: number;
  nbUsers: number;
  userConnected = false;
  answerNeeded = false;
  displayResults = false;
  answers = [];
  questionAsked: string;
  partyStarted = false;

  constructor(private chatService: ChatService) {
  }

  ngOnInit() {
    this.nbMaxUsers = 2;
  }

  signUp() {
    this.chatService.connection(this.pseudo);
    this.userConnected = true;
    this.chatService.messages.subscribe(msg => {
        console.log(msg);
        this.initBools();

        if (!this.partyStarted) {
          this.nbUsers = msg.nbUsers;
          if (msg.nbUsers === this.nbMaxUsers) {
            this.chatService.usersReady();
            this.partyStarted = true;
          }
        } else {
          if (msg.type === 'question') {
            this.answerNeeded = true;
            this.questionAsked = msg.value.question;
            this.messages.push(msg);
          }
          if (msg.type === 'answers') {
            this.displayResults = true;
            this.answers = msg.value.answers;
          }
        }
      },
      error => console.log(error));
  }

  sendLie() {
    this.answerNeeded = false;
    this.chatService.sendLie(this.currentAnswer);
  }

  private initBools(): void {
    this.answerNeeded = false;
    this.displayResults = false;
  }

  chooseLie(i: number) {
    this.chatService.sendLieChoosen(this.answers[i]);
  }
}
