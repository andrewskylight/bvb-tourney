import { Component } from '@angular/core';
import groupsData from '../api/groups.json';
import matchesData from '../api/matches.json';

import { MatDialog } from '@angular/material/dialog';
import { SetDialogComponent, SetDialogData } from '../set-dialog/set-dialog.component';

import { MatchService } from '../match.service';

import { IGroup, IMatch, ISet } from '../shared/interfaces';
import setSchema from '../api/setSchema.json';


import { Match } from '../shared/match';
import { Set } from '../shared/set';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent {

  Groups: IGroup[] = groupsData;
  //Matches: IMatch[] = matchesData;
  teams: String[] = [];
  matches: Match[];
  selectedTeam = "All";

  constructor(private dialog: MatDialog, private matchService: MatchService) {
    groupsData.forEach(row => {
      row.teams.forEach(team => {
        this.teams.push(team)
      });
    });
  }

  ngOnInit(): void {
    this.matchService.getMatches()
      .subscribe(matches => {
        this.matches = matches;
        this.initMatches();});
  }

  initMatches(){
    this.matches.forEach(match => {
      let matchHelper = new Match(match, setSchema);
      matchHelper.AddSetIfNeeded()}
      );
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

  editSet(match: Match, set: ISet, swapTeams: boolean): void {
    const dialogRef = this.dialog.open(SetDialogComponent, {
      width: '245px',
      position: {top:'0px'} ,
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
      let match = new Match (result.match, setSchema);
      match.AddSetIfNeeded();

      // if (match.isTieBreakerRequired())
      //   result.match.sets.push(match.GenTieBreakerSet());
      // else
      // {
      //   if (match.hasTieBreakerSet() && !match.isTieBreakerRequired())
      //     result.match.sets.pop();
      // }

      this.matchService.updateMatch(result.match).subscribe();
    });
  }
}