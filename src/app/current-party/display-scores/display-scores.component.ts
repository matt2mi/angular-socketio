import {Component, Input, OnInit} from '@angular/core';
import {WebsocketService} from '../../shared/websocket.service';

@Component({
  selector: 'app-display-scores',
  templateUrl: './display-scores.component.html',
  styleUrls: ['./display-scores.component.css']
})
export class DisplayScoresComponent implements OnInit {

  @Input() questionAsked: string;
  @Input() results = [];
  @Input() scores = [];
  @Input() pseudo: string;

  isWinning = false;
  restartState = false;

  constructor(private webSocketService: WebsocketService) {
  }

  ngOnInit() {
    this.setIsWinning();
  }

  restart(): void {
    this.webSocketService.restart(this.pseudo);
    this.restartState = true;
  }

  unRestart(): void {
    this.webSocketService.unRestart(this.pseudo);
    this.restartState = false;
  }

  private setIsWinning() {
    const current = this.scores.find(score => score.pseudo === this.pseudo);
    this.isWinning = !this.scores.some(score => score.value > current.value);
  }

}
