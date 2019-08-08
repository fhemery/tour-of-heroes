import { Injectable } from "@angular/core";
import { Tournament } from "./model/tournament";
import { Match } from "./model/match";
import { HeroService } from "./hero.service";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { Round } from "./model/round";
import { Hero } from "./hero";

@Injectable({
  providedIn: "root"
})
export class TournamentService {
  constructor(private heroService: HeroService) {}

  public createTournament(): Observable<Tournament> {
    return this.heroService
      .getHeroes()
      .pipe(map(heroes => this.matchHeroes(heroes)));
  }

  public startMatch(tournament: Tournament, match: Match) {
    const totalForce = match.opponent1.strength + match.opponent2.strength;
    const winner = Math.round(Math.random() * totalForce) <= match.opponent1.strength ? match.opponent1: match.opponent2;
    this.setWinnerAndAdvanceToNextMatch(tournament, match, winner);
  }

  private matchHeroes(heroes: any): Tournament {
    const tournament = new Tournament();

    if (heroes && heroes.length > 0) {
      const nbRoundsNeeded = this.computeNbRoundsNeeded(heroes.length);
      this.generateAllMatches(tournament, nbRoundsNeeded);

      this.fillInFirstTurn(tournament, heroes);
      this.setAllMatchesAsReadyForFirstTurnAndAdvanceWinners(tournament);
    }

    return tournament;
  }

  private computeNbRoundsNeeded(numberOfHeroes: number): number {
    let nbHeroesAtThisRound = 2;
    let round = 1;

    while (nbHeroesAtThisRound < numberOfHeroes) {
      round += 1;
      nbHeroesAtThisRound *= 2;
    }
    return round;
  }

  private generateAllMatches(tournament: Tournament, nbRounds: number): void {
    for (let i = 0; i < nbRounds; ++i){
      const newRound = new Round();
      newRound.id = nbRounds - i;
      tournament.rounds.push(newRound);

      for (let nbMatch = 0; nbMatch < Math.pow(2, i); ++nbMatch){
        const newMatch = new Match();
        newMatch.id = nbMatch + 1;
        newMatch.roundId = newRound.id;
        newRound.matches.push(newMatch);
      }
    }
    tournament.rounds = tournament.rounds.reverse();
  }

  private fillInFirstTurn(tournament: Tournament, heroes: Hero[]): void {
    let currentMatchNumber = 0;
    let isFirstOpponent = true;
    const roundMatches = tournament.rounds[0].matches;
    const nbMatchesinRound = roundMatches.length;

    for (let hero of heroes){
      if (currentMatchNumber >= nbMatchesinRound){
        isFirstOpponent = false;
        currentMatchNumber = 0;
      }
      if (isFirstOpponent){
        roundMatches[currentMatchNumber].opponent1 = hero;
      } else {
        roundMatches[currentMatchNumber].opponent2 = hero;
      }
      ++currentMatchNumber;
    }
  }

  private setAllMatchesAsReadyForFirstTurnAndAdvanceWinners(tournament: Tournament): void {
    tournament.rounds[0].matches.forEach(m => {
      m.isReady = true;
      if (!m.opponent2){
        this.setWinnerAndAdvanceToNextMatch(tournament, m, m.opponent1);
      }
    } );
    
  }

  private setWinnerAndAdvanceToNextMatch(tournament: Tournament, match: Match, winner: Hero): any {
    match.winner = winner;
    
    const matchPosition = match.id - 1;
    if (tournament.rounds.length > match.roundId){
      const nextMatchForWinner = tournament.rounds[match.roundId].matches[Math.floor(matchPosition / 2)];
      
      if (matchPosition % 2 === 0){
        nextMatchForWinner.opponent1 = winner;
      } else {
        nextMatchForWinner.opponent2 = winner;
      }

      if (nextMatchForWinner.opponent1 && nextMatchForWinner.opponent2){
        nextMatchForWinner.isReady = true;
      }
    }
    
  }
}
