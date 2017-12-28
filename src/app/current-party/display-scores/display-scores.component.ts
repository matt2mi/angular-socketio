import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-display-scores',
  templateUrl: './display-scores.component.html',
  styleUrls: ['./display-scores.component.css']
})
export class DisplayScoresComponent implements OnInit {

  @Input()
  questionAsked: string;
  @Input()
  results = [];
  @Input()
  scores = [];
  @Input()
  pseudo: string;

  isWinning = false;

  constructor() {
  }

  ngOnInit() {
    this.setIsWinning();
  }

  private setIsWinning() {
    const current = this.scores.find(score => score.pseudo === this.pseudo);
    this.isWinning = !this.scores.some(score => score.value > current.value);
  }

}
