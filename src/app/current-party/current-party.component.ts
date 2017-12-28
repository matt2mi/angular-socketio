import {Component, OnInit} from '@angular/core';
import {ChatService} from '../shared/chat.service';
import {DataService} from '../data.service';

@Component({
  selector: 'app-current-party',
  templateUrl: './current-party.component.html',
  styleUrls: ['./current-party.component.css']
})
export class CurrentPartyComponent implements OnInit {
  currentAnswer: string;
  pseudo = 'matt';
  url = '';
  players = [];
  nbMaxPlayers: number;
  playersLies = [];
  pcLies = [];
  lies = [];
  questionAsked: string;
  goodAnswers = [];
  results = [];
  scores = [];

  userConnected = false;
  partyStarted = false;
  displayQuestion = false;
  displayAnswerForm = false;
  displayGoodAnswerMessage = false;
  displayLies = false;
  displayScores = false;
  readyState = true;

  constructor(private chatService: ChatService,
              private dataService: DataService) {
  }

  ngOnInit() {
    this.url = window.location.href.split('/')[2].split(':')[0];
  }

  signUp() {
    this.chatService.connection(this.pseudo, this.url);
    this.setPseudo(this.pseudo);
    this.userConnected = true;
    this.chatService.messages.subscribe(msg => {
        console.log(msg.type);

        if (!this.partyStarted) {

          this.players = msg.players;
          if (msg.nbMaxPlayers) {
            this.nbMaxPlayers = msg.nbMaxPlayers;
          }

          if (msg.type === 'all-wants-start' || this.players.length === this.nbMaxPlayers) {
            this.nbMaxPlayers = msg.players.length; // if all wants start case
            this.chatService.usersReady();
            this.partyStarted = true;
          }
        } else {
          if (msg.type === 'question') {
            this.displayQuestion = this.displayAnswerForm = true;
            this.questionAsked = msg.question;
            this.goodAnswers = msg.answers;
          }
          if (msg.type === 'lies') {
            this.playersLies = msg.playersLies;
            this.lies = this.playersLies.concat(msg.pcLies).concat(msg.goodAnswers);
            console.log('lies', this.lies);
            this.displayLies = true;
          }
          if (msg.type === 'scores') {
            this.results = this.calculateResults(msg);
            this.scores = this.calculateScores();
            this.displayScores = true;
          }
        }
      },
      error => console.log(error));
  }

  startParty() {
    this.chatService.startParty(this.pseudo);
    this.readyState = false;
  }

  unStartParty() {
    this.chatService.unStartParty();
    this.readyState = true;
  }

  sendLie() {
    if (this.isCurrentLieAGoodAnswer()) {
      this.displayGoodAnswerMessage = true;
      this.currentAnswer = '';
    } else {
      this.displayAnswerForm = false;
      this.displayGoodAnswerMessage = false;
      this.chatService.sendLie(this.currentAnswer);
    }
  }

  chooseAnswer(i: number) {
    this.displayQuestion = false;
    this.displayLies = false;
    this.chatService.sendAnswer(this.pseudo, this.lies[i]);
  }

  setPseudo(pseudo: string): void {
    // send pseudo to subscribers (header navbar) via observable subject
    this.dataService.setPseudo(pseudo);
  }

  public calculateResults({playersAnswers, goodAnswer}) {
    // playersAnswers: { pseudo: string, answer: { pseudo: string, value: string } }[]

    const results = [];
    playersAnswers.forEach(({answer}) => {
      const test = results.some(res => res.answer.value === answer.value);
      if (!test) {
        const resultLine = {
          answer: {truth: answer.pseudo === 'truth', pseudo: answer.pseudo, value: answer.value},
          players: []
        };
        results.push(resultLine);
      }
    });
    if (!results.some(res => res.answer.truth)) {
      results.push({
        answer: {truth: true, pseudo: goodAnswer.pseudo, value: goodAnswer.value},
        players: []
      });
    }

    results.forEach(result => {
      const res = playersAnswers.filter(ans => {
        return ans.answer.pseudo === result.answer.pseudo;
      });
      result.players = res.map(re => {
        return re.pseudo;
      });
    });

    return results;
  }

  public calculateScores(): { pseudo: string, value: number }[] {
    const scoresMap = new Map();
    this.players.forEach(({pseudo}) => {
      scoresMap.set(pseudo, 0);
    });

    this.results.forEach(res => {
      if (res.answer.truth) {
        res.players.forEach(player => scoresMap.set(player, scoresMap.get(player) + 500));
      } else {
        scoresMap.set(res.answer.pseudo, scoresMap.get(res.answer.pseudo) + 200);
      }
    });

    return Array.from(scoresMap)
      .map(score => {
        return {pseudo: score[0], value: score[1]};
      });
  }

  private isCurrentLieAGoodAnswer() {
    return this.goodAnswers.some(gA => gA === this.currentAnswer.toLowerCase());
  }
}
