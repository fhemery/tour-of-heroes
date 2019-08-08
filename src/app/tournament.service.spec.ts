import { TestBed, inject } from "@angular/core/testing";

import { TournamentService } from "./tournament.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HeroService } from "./hero.service";
import { Observable, of } from "rxjs";
import { Hero } from "./hero";
import { HEROES } from "./mock-heroes";
import { Tournament } from "./model/tournament";
import { Match } from "./model/match";
import { Round } from "./model/round";

describe("TournamentService", () => {
  let tournamentService: TournamentService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TournamentService],
      imports: [HttpClientTestingModule]
    });
  });

  beforeEach(inject([TournamentService], (service: TournamentService) => {
    tournamentService = service;
  }));

  it("should be created", () => {
    expect(tournamentService).toBeTruthy();
  });

  describe("function createTournament", () => {
    describe("when there are no heroes", () => {
      beforeEach(() => {
        const heroSvc = TestBed.get(HeroService) as HeroService;
        spyOn(heroSvc, "getHeroes").and.returnValue(of([]));
      });

      it("should return an empty tournament", done => {
        tournamentService.createTournament().subscribe(tournament => {
          expect(tournament.rounds.length).toBe(0);
          done();
        });
      });
    });

    describe("when there are 2 heroes", () => {
      beforeEach(() => {
        const heroSvc = TestBed.get(HeroService) as HeroService;
        spyOn(heroSvc, "getHeroes").and.returnValue(
          of([new Hero(1, "Saitama", 100), new Hero(2, "Genos", 87)])
        );
      });

      it("should generate one single match with these two heroes", done => {
        tournamentService.createTournament().subscribe(tournament => {
          expect(tournament.rounds.length).toBe(1);
          done();
        });
      });
    });

    describe("when there is a huge number of heroes", () => {
      beforeEach(() => {
        const heroSvc = TestBed.get(HeroService) as HeroService;
        spyOn(heroSvc, "getHeroes").and.returnValue(of(HEROES.slice(0, 6)));
      });

      let tournament: Tournament;
      beforeEach(done => {
        tournamentService.createTournament().subscribe(t => {
          tournament = t;
          done();
        });
      });

      it("should create as much rounds as needed to ensure each hero as one starting match", () => {
        expect(tournament.rounds.length).toBe(3);
      });

      it("should create all empty matches", () => {
        expect(tournament.rounds[0].matches.length).toBe(4);
        expect(tournament.rounds[1].matches.length).toBe(2);
        expect(tournament.rounds[2].matches.length).toBe(1);
      });

      it("should fill first opponents as much as possible, then second opponent", () => {
        const firstRound = tournament.rounds[0];
        checkHeroesInMatch(firstRound.matches[0], HEROES[0], HEROES[4], true);
        checkHeroesInMatch(firstRound.matches[1], HEROES[1], HEROES[5], true);
        checkHeroesInMatch(firstRound.matches[2], HEROES[2], undefined, true);
        checkHeroesInMatch(firstRound.matches[3], HEROES[3], undefined, true);
      });

      it("should make people with no opponent advance to next round", () => {
        const secondRound = tournament.rounds[1];
        checkHeroesInMatch(secondRound.matches[0], undefined, undefined, false);
        checkHeroesInMatch(secondRound.matches[1], HEROES[2], HEROES[3], true);
      });
    });

    function checkHeroesInMatch(
      match: Match,
      hero1: Hero,
      hero2: Hero,
      isReady: boolean
    ) {
      expect(match.opponent1).toBe(hero1);
      expect(match.opponent2).toBe(hero2);
      expect(match.isReady).toBe(isReady);
    }
  });

  describe("startMatch function", () => {
    let tournament: Tournament;
    beforeEach(() => {
      tournament = generateTournament();
      tournamentService.startMatch(tournament, tournament.rounds[0].matches[0]);
    });

    it('should set the winner through random pick', () => {
      expect(tournament.rounds[0].matches[0].winner.id).toBe(3);
    });

    it('should advance user to next match', () => {
      const nextMatch = tournament.rounds[1].matches[0];
      expect(nextMatch.opponent1.id).toBe(3);
      expect(nextMatch.isReady).toBe(true);
    })
  });

  function generateTournament() : Tournament{
    const hero1 = new Hero(1, "RouletteRider", 0);
    const hero2 = new Hero(2, "Saitama", 100);
    const hero3 = new Hero(3, "Genos", 87);
    const t = {
      rounds: [
        {
          id: 12,
          matches: [
            {
              id: 1,
              opponent1: hero1,
              opponent2: hero3,
              isReady: true,
              roundId: 1
            } as Match,
            { id: 2, opponent1: hero2, winner: hero2 }
          ]
        } as Round,
        {
          id: 13,
          matches: [
            {
              id: 3,
              opponent2: hero2,
              isReady: false
            } as Match
          ]
        } as Round
      ]
    } as Tournament;

    return t;
  }
});
