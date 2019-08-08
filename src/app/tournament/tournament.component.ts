import { Component, OnInit } from '@angular/core';
import { TournamentService } from '../tournament.service';
import { Tournament } from '../model/tournament';
import { Match } from '../model/match';

@Component({
  selector: 'app-tournament',
  templateUrl: './tournament.component.html',
  styleUrls: ['./tournament.component.css']
})
export class TournamentComponent implements OnInit {

  public isTournamentStarted: boolean;
  public tournament: Tournament;

  constructor(private tournamentService: TournamentService) { }

  ngOnInit() {
  }

  public startTournament(){
    this.tournamentService.createTournament().subscribe(tournament => {
      this.isTournamentStarted = true;
      this.tournament = tournament;
    });
  }

  public startMatch(match: Match){
    this.tournamentService.startMatch(this.tournament, match);
  }

}
