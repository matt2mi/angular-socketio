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
  currentAnswer: string;
  pseudo = 'matt';
  url = 'localhost';
  players = [];
  playersss = [{pseudo: null}, {pseudo: null}, {pseudo: null}, {pseudo: null}];
  nbMaxPlayers: number;
  nbUsers: number;
  playersLies = [];
  questionAsked: string;
  scores = [];

  userConnected = false;
  partyStarted = false;
  displayQuestion = false;
  displayAnswerForm = false;
  displayLies = false;
  displayScores = false;

  constructor(private chatService: ChatService) {
  }

  ngOnInit() {
  }

  signUp() {
    this.chatService.connection(this.pseudo, this.url);
    this.userConnected = true;
    this.chatService.messages.subscribe(msg => {
        console.log(msg);

        if (!this.partyStarted) {
          if (msg.type === 'new-user-detail') {
            this.players = msg.playersName;
            console.log(msg.playersName);
            msg.playersName.forEach((name, i) => this.playersss[i].pseudo = name);
            this.nbUsers = msg.nbUsers;
            this.nbMaxPlayers = msg.nbMaxPlayers;
          }
          if (msg.nbUsers === this.nbMaxPlayers) {
            this.chatService.usersReady();
            this.partyStarted = true;
          }
        } else {
          if (msg.type === 'question') {
            this.displayQuestion = this.displayAnswerForm = true;
            this.questionAsked = msg.question;
          }
          if (msg.type === 'lies') {
            this.playersLies = msg.playersLies;
            this.displayLies = true;
          }
          if (msg.type === 'scores') {
            this.scores = this.calculateScores(msg);
            console.log(this.scores);
            this.displayScores = true;
          }
        }
      },
      error => console.log(error));
  }

  sendLie() {
    this.displayAnswerForm = false;
    this.chatService.sendLie(this.currentAnswer);
  }

  chooseAnswer(i: number) {
    this.displayQuestion = false;
    this.displayLies = false;
    this.chatService.sendAnswer(this.pseudo, this.playersLies[i]);
  }

  private calculateScores({playersAnswers}) {
    console.log(playersAnswers);
    const scores = new Map();
    playersAnswers.map(playersAnswer => {
      scores.set(playersAnswer.pseudo, 0);
    });

    playersAnswers.forEach(({answer}) => {
      scores.set(answer.pseudo, scores.get(answer.pseudo) + 100);
    });

    return Array.from(scores).map(score => {
      return {pseudo: score[0], value: score[1]};
    });
  }
}
