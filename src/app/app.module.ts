import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ChatService} from './shared/chat.service';
import {WebsocketService} from './shared/websocket.service';
import {UserService} from './shared/user.service';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [ChatService, WebsocketService, UserService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
