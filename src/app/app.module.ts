import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';

import {AppComponent} from './app.component';
import {ChatService} from './shared/chat.service';
import {WebsocketService} from './shared/websocket.service';
import {UserService} from './shared/user.service';
import {AppRoutingModule} from './app-routing.module';
import {SettingComponent} from './setting/setting.component';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {path: 'setting', component: SettingComponent},
  {path: '', redirectTo: '/setting', pathMatch: 'full'}
];

@NgModule({
  declarations: [
    AppComponent,
    SettingComponent
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
    UserService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

// Routing : https://codecraft.tv/courses/angular/routing/routing-strategies/
