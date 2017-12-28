import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ChatService} from './shared/chat.service';
import {WebsocketService} from './shared/websocket.service';
import {AppRoutingModule} from './app-routing.module';
import {CurrentPartyComponent} from './current-party/current-party.component';
import {RouterModule, Routes} from '@angular/router';
import {DataService} from './data.service';
import {HeaderComponent} from './header/header.component';
import { DisplayScoresComponent } from './current-party/display-scores/display-scores.component';

const routes: Routes = [
  {path: 'current', component: CurrentPartyComponent},
  {path: '', redirectTo: '/current', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    CurrentPartyComponent,
    HeaderComponent,
    DisplayScoresComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
  providers: [
    ChatService,
    WebsocketService,
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
