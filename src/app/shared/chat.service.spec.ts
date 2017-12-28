import {TestBed, inject} from '@angular/core/testing';

import {ChatService} from './chat.service';
import {WebsocketService} from './websocket.service';

describe('ChatService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatService, WebsocketService]
    });
  });

  it('should be created', inject([ChatService], (service: ChatService) => {
    expect(service).toBeTruthy();
  }));
});
