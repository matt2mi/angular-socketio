import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs/Subscription';
import {DataService} from '../data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  pseudo = '';
  subscription: Subscription;

  constructor(private dataService: DataService) {
  }

  ngOnInit() {
    this.subscription = this.dataService
      .getPseudo()
      .subscribe(pseudo => this.pseudo = pseudo.text);
  }

  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }

}
