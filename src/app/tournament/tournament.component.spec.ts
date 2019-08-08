import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { TournamentComponent } from "./tournament.component";
import { By } from "@angular/platform-browser";
import { TournamentService } from "../tournament.service";
import { Tournament } from "../model/tournament";
import { Round } from "../model/round";
import { Hero } from "../hero";
import { Match } from "../model/match";
import { start } from "repl";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { HeroService } from "../hero.service";
import { of } from "rxjs";

describe("TournamentComponent", () => {
  let component: TournamentComponent;
  let fixture: ComponentFixture<TournamentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [TournamentComponent],
      providers:[TournamentService, HeroService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TournamentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("When no tournament is started", () => {
    it("should have a no tournament zone with a button to create one", () => {
      expect(
        fixture.debugElement.query(By.css(".no-tournament"))
      ).not.toBeNull();
      expect(
        fixture.debugElement.query(By.css("button#createTournament"))
      ).not.toBeNull();
    });

    describe("when clicking on the button", () => {
      let tournamentService: TournamentService;
      beforeEach(() => {
        tournamentService = TestBed.get(TournamentService);
        spyOn(tournamentService, "createTournament").and.returnValue(of(generateTournament()));
        fixture.debugElement
          .query(By.css("#createTournament"))
          .nativeElement.click();
        fixture.detectChanges();
      });

      it("should make the no tournament area disappear", () => {
        expect(
          fixture.debugElement.queryAll(By.css(".no-tournament")).length
        ).toBe(0);
      });

      it("should call the tournament service to warn competition started", () => {
        expect(tournamentService.createTournament).toHaveBeenCalled();
      });

      it("should display one column per round", () => {
        expect(fixture.debugElement.queryAll(By.css('.round')).length).toBe(2);
      });

      it('should display one match box for each match', () => {
        expect(fixture.debugElement.queryAll(By.css('.match')).length).toBe(3);
      });

      it('should display the two opponents of a match', () => {
        const match1 = fixture.debugElement.query(By.css('#match1'));
        expect(match1).not.toBeNull();

        const allOpponents = fixture.debugElement.queryAll(By.css('#match1 .opponent'));
        expect(allOpponents.length).toBe(2);
        expect(allOpponents[0].nativeElement.innerHTML).toBe('RouletteRider');
        expect(allOpponents[1].nativeElement.innerHTML).toBe('Genos');
      });

      it('should display a dash when there is no opponent', () => {
        const opponentsForMatch2 = fixture.debugElement.queryAll(By.css('#match2 .opponent'));
        expect(opponentsForMatch2[1].nativeElement.innerHTML).toBe('-');
      });

      it('should highlight the winner', () => {
        const opponentsForMatch1 = fixture.debugElement.queryAll(By.css('#match1 .opponent'));
        expect(opponentsForMatch1[1].nativeElement.getAttribute('class')).toContain('winner');
      });

      it('should display a play button on the matches that are not over', () => {
        const finalMatchPlayBtn = fixture.debugElement.query(By.css('#match3 button'));
        expect(finalMatchPlayBtn).not.toBeNull();

        const semiFinalsMatch1Button = fixture.debugElement.query(By.css('#match1 button'));
        expect(semiFinalsMatch1Button).toBeNull();

        const semiFinalsMatch2Button = fixture.debugElement.query(By.css('#match2 button'));
        expect(semiFinalsMatch2Button).toBeNull();
      });

      describe('on click on a match button', () => {
        let startMatchSpy: jasmine.Spy;
        beforeEach(() => {
          startMatchSpy = spyOn(tournamentService, 'startMatch');
          const finalMatchPlayBtn = fixture.debugElement.query(By.css('#match3 button'));
          finalMatchPlayBtn.nativeElement.click();

          fixture.detectChanges();
        });

        it('should call the startMatch method of the tournament', () => {
          expect(startMatchSpy).toHaveBeenCalled();
        });
      })
    });
  });

  function generateTournament() {
    const hero1 = new Hero(1, "RouletteRider", 21);
    const hero2 = new Hero(2, "Saitama", 100);
    const hero3 = new Hero(3, "Genos", 87);
    const t = {
      rounds: [
        {
          id: 12,
          matches: [
            { id: 1, opponent1: hero1, opponent2: hero3, winner: hero3 } as Match,
            { id: 2, opponent1: hero2, winner: hero2 }
          ]
        } as Round,
        {
          id: 13,
          matches: [
            {id: 3, opponent1: hero1, opponent2: hero2, isReady: true} as Match
          ]
        } as Round
      ]
    } as Tournament;

    return t;
  }
});
