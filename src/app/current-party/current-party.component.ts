import {Component, OnInit} from '@angular/core';
import {ChatService} from '../shared/chat.service';
import {DataService} from '../data.service';

interface Result {
  answer: {
    truth: boolean, pseudo: string, value: string
  };
  players: string[];
}

interface Score {
  pseudo: string;
  value: number;
}

interface Player {
  pseudo: string;
}

@Component({
  selector: 'app-current-party',
  templateUrl: './current-party.component.html',
  styleUrls: ['./current-party.component.css']
})
export class CurrentPartyComponent implements OnInit {
  currentAnswer: string;
  pseudo = 'matt';
  url = '';
  players: Player[];
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

  signUp(): void {
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

          if (msg.type === 'all-want-start' || this.players.length === this.nbMaxPlayers) {
            this.nbMaxPlayers = msg.players.length; // if all wants start case
            this.chatService.usersReady();
            this.partyStarted = true;
            this.displayScores = false;
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
            this.partyStarted = false;
          }
        }
      },
      error => console.log(error));
  }

  startParty(): void {
    this.chatService.startParty(this.pseudo);
    this.readyState = false;
  }

  unStartParty(): void {
    this.chatService.unStartParty();
    this.readyState = true;
  }

  sendLie(): void {
    if (this.isCurrentLieAGoodAnswer()) {
      this.displayGoodAnswerMessage = true;
      this.currentAnswer = '';
    } else {
      this.displayAnswerForm = false;
      this.displayGoodAnswerMessage = false;
      this.chatService.sendLie(this.currentAnswer);
    }
  }

  chooseAnswer(i: number): void {
    this.displayQuestion = false;
    this.displayLies = false;
    this.chatService.sendAnswer(this.pseudo, this.lies[i]);
  }

  setPseudo(pseudo: string): void {
    // send pseudo to subscribers (header navbar) via observable subject
    this.dataService.setPseudo(pseudo);
  }

  calculateResults({playersAnswers, goodAnswer}): Result[] {
    const results = this.setAllAnswersInResults(playersAnswers, goodAnswer);

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

  setAllAnswersInResults(playersAnswers: any, goodAnswer: any): Result[] {
    const results = [];
    playersAnswers.forEach(({answer}) => {
      if (!results.some(res => res.answer.value === answer.value)) {
        // si pas déjà la réponse dans results
        const resultLine = {
          answer: {truth: answer.pseudo === 'truth', pseudo: answer.pseudo, value: answer.value},
          players: []
        };
        results.push(resultLine);
      }
    });
    if (!results.some(res => res.answer.truth)) {
      // results a-t-il la bonne réponse
      results.push({
        answer: {truth: true, pseudo: goodAnswer.pseudo, value: goodAnswer.value},
        players: []
      });
    }
    return results;
  }

  calculateScores(): Score[] {
    // créer tableau des scores avec tous les pseudos des joueurs
    const scoresMap = new Map<string, number>();
    this.players.forEach(({pseudo}) => {
      scoresMap.set(pseudo, 0);
    });

    // calcule les scores de chaque joueur
    this.calculateScoreByAnswer(scoresMap);

    return Array.from(scoresMap)
      .map(score => {
        return {pseudo: score[0], value: score[1]};
      });
  }

  calculateScoreByAnswer(scoresMap: Map<string, number>): void {
    this.results.forEach(res => {
      if (res.answer.truth) {
        res.players.forEach(player => scoresMap.set(player, scoresMap.get(player) + 500));
      } else if (res.answer.pseudo === 'pc') {
        // on enlève 500 au joueurs ayants voté pour un mensonge de l'ordi
        res.players.forEach(player => scoresMap.set(player, scoresMap.get(player) - 200));
      } else {
        // on ajoute au score du menteur 200 fois le nombre de joueurs ayant voté pour lui
        scoresMap.set(res.answer.pseudo, scoresMap.get(res.answer.pseudo) + 200 * res.players.length);
      }
    });
  }

  isCurrentLieAGoodAnswer(): boolean {
    return this.goodAnswers.some(gA => gA === this.currentAnswer.toLowerCase());
  }
}
