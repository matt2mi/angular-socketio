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
  nbMaxPlayers: number;
  nbUsers: number;
  playersLies = [];
  questionAsked: string;

  userConnected = false;
  partyStarted = false;
  displayQuestion = false;
  displayAnswerForm = false;
  displayLies = false;
  displayScores = false;

  constructor(private chatService: ChatService) {
  }

  ngOnInit() {
    this.nbMaxPlayers = 2;
  }

  signUp() {
    this.chatService.connection(this.pseudo, this.url);
    this.userConnected = true;
    this.chatService.messages.subscribe(msg => {
        console.log(msg);

        if (!this.partyStarted) {
          this.nbUsers = msg.nbUsers;
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
            this.calculateScores(msg);
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
    this.chatService.sendAnswer(this.playersLies[i]);
  }

  private calculateScores({playersLies, playersAnswers}) {
    // let scores: {pseudo: string, score: number}[] = [];
    //
    // playersAnswers.forEach(playerAnswer => {
    //   const winner = this.whoIsThisLie()
    // });

    console.log(playersLies);
    console.log(playersAnswers);
  }

  private whoIsThisLie(lieToFind: string, liesList: any[]): string {
    const lieFound = liesList.find(lie => lie === lieToFind);
    console.log(lieFound);
    return lieFound;
  }
}
