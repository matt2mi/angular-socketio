import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CurrentPartyComponent} from './current-party.component';
import {DataService} from '../data.service';
import {ChatService} from '../shared/chat.service';
import {FormsModule} from '@angular/forms';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';

describe('CurrentPartyComponent', () => {
  let component: CurrentPartyComponent;
  let fixture: ComponentFixture<CurrentPartyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [FormsModule],
      declarations: [CurrentPartyComponent],
      providers: [
        {
          provide: ChatService,
          useClass: class {
            messages = {};
            connection = jasmine.createSpy('connection');
            usersReady = jasmine.createSpy('usersReady');
            startParty = jasmine.createSpy('startParty');
            unStartParty = jasmine.createSpy('unStartParty');
            sendLie = jasmine.createSpy('sendLie');
            sendAnswer = jasmine.createSpy('sendAnswer');
          }
        },
        {
          provide: DataService,
          useClass: class {
            setPseudo = jasmine.createSpy('setPseudo');
          }
        }
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CurrentPartyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create result tab - no good', () => {
    const playersAnswers = [
      {pseudo: 'mimi', answer: {pseudo: 'matt', value: 'matt'}},
      {pseudo: 'matt', answer: {pseudo: 'matt', value: 'matt'}}
    ];
    const goodAnswer = {pseudo: 'truth', value: 'truth'};

    const result = component.calculateResults({playersAnswers, goodAnswer});

    expect(result[0].answer.value).toEqual('matt');
    expect(result[0].players).toContain('mimi');
    expect(result[0].players).toContain('matt');

    expect(result[1].answer.value).toEqual('truth');
    expect(result[1].answer.truth).toBeTruthy();
  });

  it('should create result tab - with 1 good & 1 lie', () => {
    const playersAnswers = [
      {pseudo: 'mimi', answer: {pseudo: 'matt', value: 'matt'}},
      {pseudo: 'matt', answer: {pseudo: 'truth', value: 'truth'}}
    ];
    const goodAnswer = {pseudo: 'truth', value: 'truth'};

    const result = component.calculateResults({playersAnswers, goodAnswer});

    expect(result[0].answer.value).toEqual('matt');
    expect(result[0].players).toContain('mimi');

    expect(result[1].answer.value).toEqual('truth');
    expect(result[1].answer.truth).toBeTruthy();
    expect(result[1].players).toContain('matt');
  });

  it('should create result tab - 3 players - 3 answers differents - no good', () => {
    const playersAnswers = [
      {pseudo: 'mimi', answer: {pseudo: 'matt', value: 'matt'}},
      {pseudo: 'matt', answer: {pseudo: 'timo', value: 'timo'}},
      {pseudo: 'timo', answer: {pseudo: 'mimi', value: 'mimi'}}
    ];
    const goodAnswer = {pseudo: 'truth', value: 'truth'};

    const result = component.calculateResults({playersAnswers, goodAnswer});

    expect(result[0].answer.value).toEqual('matt');
    expect(result[0].players).toEqual(['mimi']);

    expect(result[1].answer.value).toEqual('timo');
    expect(result[1].players).toEqual(['matt']);

    expect(result[2].answer.value).toEqual('mimi');
    expect(result[2].players).toEqual(['timo']);

    expect(result[3].answer.value).toEqual('truth');
    expect(result[3].answer.truth).toBeTruthy();

    expect(result.length).toEqual(4);
  });

  it('should create result tab - 3 players - 3 same answers - no good', () => {
    const playersAnswers = [
      {pseudo: 'mimi', answer: {pseudo: 'matt', value: 'matt'}},
      {pseudo: 'matt', answer: {pseudo: 'matt', value: 'matt'}},
      {pseudo: 'timo', answer: {pseudo: 'matt', value: 'matt'}}
    ];
    const goodAnswer = {pseudo: 'truth', value: 'truth'};

    const result = component.calculateResults({playersAnswers, goodAnswer});

    expect(result[0].answer.value).toEqual('matt');
    expect(result[1].answer.value).toEqual('truth');
    expect(result[1].answer.truth).toBeTruthy();
    expect(result.length).toEqual(2);
  });

  it('should create scores tab - 3 players - 1 good, 1 lie, 1 nul', () => {
    component.players = [
      {pseudo: 'timo'},
      {pseudo: 'mimi'},
      {pseudo: 'matt'}
    ];
    component.results = [
      {
        answer: {truth: true, pseudo: 'truth', value: 'bébés'},
        players: ['timo']
      },
      {
        answer: {truth: false, pseudo: 'matt', value: 'matt'},
        players: ['mimi']
      },
      {
        answer: {truth: false, pseudo: 'timo', value: 'timo'},
        players: ['matt']
      }
    ];

    const scores = component.calculateScores();

    expect(scores).toContain({pseudo: 'timo', value: 700});
    expect(scores).toContain({pseudo: 'matt', value: 200});
    expect(scores).toContain({pseudo: 'mimi', value: 0});
  });
});
