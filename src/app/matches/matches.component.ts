import { Component } from '@angular/core';
import groupsData from '../api/groups.json';
import matchesData from '../api/matches.json';

import { MatDialog } from '@angular/material/dialog';
import { SetDialogComponent, SetDialogData } from '../set-dialog/set-dialog.component';

import { MatchService } from '../match.service';

import { Group, Match, Set } from '../shared/interfaces';
import { JsonService } from 'src/json.service';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent {

  Groups: Group[] = groupsData;
  Matches: Match[] = matchesData;
  teams: String[] = [];
  matches: Match[];
  selectedTeam = "All";

  constructor(private dialog: MatDialog, private matchService: MatchService, private jsonService: JsonService) {
    groupsData.forEach(row => {
      row.teams.forEach(team => {
        this.teams.push(team)
      });
    });
  }

  ngOnInit(): void {
    this.matchService.getMatches()
      .subscribe(matches => this.matches = matches);
  }

  swapTeams(match: Match): boolean {
    return this.selectedTeam == match.team2;
  }

  displayRow(match: Match): boolean {
    let result: boolean;
    result = false;

    result = (match.team1 == this.selectedTeam || match.team2 == this.selectedTeam)

    if (this.selectedTeam == "All")
      result = true;

    return result;

  }

  getTeam1(match: Match): String {
    if (match.team2 == this.selectedTeam)
      return match.team2;
    else
      return match.team1;
  }

  getTeam2(match: Match): String {
    if (match.team2 == this.selectedTeam)
      return match.team1;
    else
      return match.team2;
  }

  getResult(match: Match): String {
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

  getTestHTML() {
    return [21, 21];
  }

  getTeamResults(match: Match, teamNo: Number): String {
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

  editSet(match: Match, set: Set, swapTeams: boolean): void {
    const dialogRef = this.dialog.open(SetDialogComponent, {
      width: '320px',
      position: {top:'0px'} ,
      data: {
        match,
        set,
        swapTeams,
        enableDelete: true,
      },
    });
    dialogRef.afterClosed().subscribe((result: SetDialogData) => {
      if (!result) {
        return;
      }
      this.matchService.updateMatch(result.match).subscribe();
    });
  }

  test(): void {

    this.matchService.getMatch(1)
      .subscribe(match => alert("Value at db: " + match.sets[0].t1_points));

    let matchOne: Match;

  }

  test2() {

    this.matches[0].sets[0].t1_points = 16;
    this.matchService.updateMatch(this.matches[0])
      .subscribe(_ => this.matchService.getMatch(1)
        .subscribe(result => alert(result.sets[0].t1_points)))
  }

  testMatchUpdate(match: Match) {
    match.sets[0].t1_points = 16;

    this.matchService.updateMatch(match)
      .subscribe(_ => this.matchService.getMatch(1)
        .subscribe(updatedMatch => alert(updatedMatch.sets[0].t1_points)))
  }
}
