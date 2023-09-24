import { Component, OnDestroy, OnInit } from '@angular/core';
import groupsData from '../api/groups.json';

import { MatDialog } from '@angular/material/dialog';
import { SetDialogComponent, SetDialogData } from '../set-dialog/set-dialog.component';

import { MatchService } from './match.service';

import { IGroup, ISet, ITeam, IMatch, ITourney, ISetSchema } from '../shared/interfaces';

import { Match } from '../shared/match';
import { Subscription } from 'rxjs';
import { LoginService } from '../login/login.service';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit, OnDestroy {

  Groups: IGroup[] = groupsData;

  matches: IMatch[];
  tourneyData: ITourney;

  matchesSubs: Subscription;
  tourneySubs: Subscription;
  selectedTeam = "";
  public showIPGMatchesOnly = false;

  constructor(private dialog: MatDialog,
    private matchService: MatchService,
    private loginService: LoginService) {
  }

  ngOnInit(): void {
    // DON'T NEED THIS
    // this.matchService.getTeams()
    //   .subscribe(teams => {
    //     this.teams = teams;
    //   });

    this.matchesSubs = this.matchService.matchesChanged.subscribe(
      matches => (this.matches = matches));

    this.tourneySubs = this.matchService.tourneyDataChanged.subscribe(
      tourneyData => (this.tourneyData = tourneyData));

    this.matchService.getTourneyData();
    this.matchService.fetchMatches();

    this.loginService.autoLogin();
    this.initSelectedTeam();

    //this.matchService.getMatches().subscribe(matches => {this.matches = matches});
  }

  ngOnDestroy() {
    this.matchesSubs.unsubscribe();
    this.tourneySubs.unsubscribe();
  }

  initMatches() {
    this.matches.forEach(
      match => {
        let matchHelper = new Match(match, this.tourneyData.setSchema);
        matchHelper.AddSetIfNeeded();
      });
  }

  initSelectedTeam() {
    if (this.matchService.getSelectedTeam() == "") {
      if (this.loginService.getAuthEmail() == "" || this.loginService.isAdminLoggedIn()){
        if (this.matchService.getSelectedTeam() == "")
          this.matchService.setSelectedTeam("All");
      }
      else{
        let selTeam = this.getTeamNameByEmail(this.loginService.getAuthEmail());
        if (selTeam != "")
          this.matchService.setSelectedTeam(selTeam);
        else
          this.matchService.setSelectedTeam("All");
      }
    }

    this.selectedTeam = this.matchService.getSelectedTeam();
  }

  getTeamNameByEmail(email: string): string {
    if (!this.tourneyData) return "";

    let teams: ITeam[] = this.tourneyData.teams;

    for (let i = 0; i < teams.length; i++) {
      if (email.toUpperCase() == teams[i].email.toUpperCase())
        return teams[i].name;
    }
    return "";
  }

  getTeamEmail(teamName: string): string {
    if (teamName == "" || !this.tourneyData)
      return "";

    let teams: ITeam[] = this.tourneyData.teams;

    for (let i = 0; i < teams.length; i++) {
      if (teams[i].name == teamName)
        return teams[i].email;
    }
    return "";
  }

  isEditable(match: IMatch): boolean {
    if (this.loginService.isAdminLoggedIn())
      return true;

    let team1Email = this.getTeamEmail(match.team1).toUpperCase();
    let team2Email = this.getTeamEmail(match.team2).toUpperCase();
    let authEmail = this.loginService.getAuthEmail().toUpperCase();

    return team1Email == authEmail || team2Email == authEmail;
  }

  swapTeams(match: IMatch): boolean {
    return this.selectedTeam == match.team2
  }

  showMatch(match: IMatch): boolean {
    if (this.selectedTeam == "All") {
      if (!this.showIPGMatchesOnly)
        //show all matches
        return true;
      else {
        //show unfinished matches for all teams
        return isMatchIPG(match, this.tourneyData.setSchema);
      }
    } else {
      if (!this.showIPGMatchesOnly)
        return (match.team1 == this.selectedTeam || match.team2 == this.selectedTeam);
      else
        return isMatchIPG(match, this.tourneyData.setSchema) &&
          (match.team1 == this.selectedTeam || match.team2 == this.selectedTeam);
    }

    function isMatchIPG(match: IMatch, setSchema: ISetSchema[]): boolean {
      let mh = new Match(match, setSchema);
      return !mh.IsMatchFinished();
    }
  }

  getTeam1(match: IMatch): String {
    if (match.team2 == this.selectedTeam)
      return match.team2;
    else
      return match.team1;
  }

  getTeam2(match: IMatch): String {
    if (match.team2 == this.selectedTeam)
      return match.team1;
    else
      return match.team2;
  }

  getResult(match: IMatch): String {
    let result = "TBD";
    let setWonCount = 0;
    let setLostCount = 0;

    match.sets.forEach(set => {
      if (set.t1_points > set.t2_points)
        setWonCount++;
      else
        setLostCount++;
    });

    if (match.team2 == this.selectedTeam) {
      //swap counters
      let tmp = setWonCount;
      setWonCount = setLostCount;
      setLostCount = tmp;
    }

    if (setWonCount > setLostCount)
      result = "Victory";
    else if (setLostCount > setWonCount)
      result = "Defeat";
    else if (setLostCount == setWonCount && setWonCount != 0)
      result = "Tie";

    return result;
  }

  onTeamSelectionChange() {
    this.matchService.setSelectedTeam(this.selectedTeam);
  }

  getTeamResults(match: IMatch, teamNo: Number): String {
    let output = "";

    if (match.sets.length == 0)
      return "TBD";

    for (let set of match.sets) {
      if (match.team2 != this.selectedTeam) {
        if (teamNo == 1)
          output += set.t1_points + " "
        else if (teamNo == 2)
          output += set.t2_points + " "
      }
      else {
        if (teamNo == 1)
          output += set.t2_points + " "
        else if (teamNo == 2)
          output += set.t1_points + " "
      }
    }
    return output;
  }

  anyoneLoggedIn(): boolean {
    return this.loginService.isLoggedIn();
  }

  editSet(match: IMatch, set: ISet, swapTeams: boolean): void {
    const dialogRef = this.dialog.open(SetDialogComponent, {
      width: '245px',
      position: { top: '0px' },
      data: {
        match,
        set,
        swapTeams,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((
      result: SetDialogData) => {
      if (!result) {
        return;
      }
      //result.match.setSetSchema(setSchema);
      console.log(result.match);

      // let test: Match = result.match;
      // test.isTieBreakerRequired();

      // if (result.match.isTieBreakerRequired())
      //   result.match.sets.push(result.match.GenTieBreakerSet());
      // else
      // {
      //   if (result.match.hasTieBreakerSet() && !result.match.isTieBreakerRequired())
      //     result.match.sets.pop();
      // }

      //for some reason angular thinks it's still an interface and not a class, hence the workaround
      let match = new Match(result.match, this.tourneyData.setSchema);

      match.RemoveSetIfNeeded();
      match.AddSetIfNeeded();

      this.matchService.updateMatch(result.match).subscribe();
    });
  }

  test(){
    this.matchService.getTourneyData();
  }
}
