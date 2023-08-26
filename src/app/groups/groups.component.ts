import { Component } from '@angular/core';
import { MatchService } from '../matches/match.service';

import { IMatch, IGroup, ISetSchema, ITourney } from '../shared/interfaces';
import { GroupStats } from '../shared/groupStats';

import { SetSchema } from '../shared/setSchema';

import { Subscription } from 'rxjs';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent {

  matches: IMatch[];
  matchesSubs: Subscription;
  tourneySubs: Subscription;

  public groups: IGroup[];
  public setSchema: ISetSchema[];
  public stats: GroupStats = new GroupStats();
  public hasTieBreaker = false;

  displayedColumns: string[] = ['Name', 'M', 'W', 'L', 'Pts', 'Set R', 'PW', 'PL', 'Rank'];

  constructor(private matchService: MatchService) { }

  ngOnInit() {

    this.matchesSubs = this.matchService.matchesChanged.subscribe(
      matches => this.onMatchesChanged(matches));

    this.tourneySubs = this.matchService.tourneyDataChanged.subscribe(
      tourneyData => this.onTourneyDataChanged(tourneyData));

    this.matchService.getTourneyData();
    this.matchService.fetchMatches();


  }

  ngOnDestroy(){
    this.matchesSubs.unsubscribe();
    this.tourneySubs.unsubscribe();
  }

  refreshGroupStats():void {
    this.stats.consumeAllMatches(this.matches);
  }

  onMatchesChanged(matches: IMatch[]):void{
    this.matches = matches;
    this.refreshGroupStats();
  }

  onTourneyDataChanged(tourneyData: ITourney):void{
    this.setGroups(tourneyData.groups);
    this.setSetSchema(tourneyData.setSchema);
    this.refreshGroupStats();
  }

  setGroups(groups: IGroup[]) {
    this.groups = groups;
    this.stats.setGroups(groups);
  }

  setSetSchema(setSchema: ISetSchema[]){
    this.setSchema = setSchema;
    this.stats.setSetSchema(setSchema);
    let sh = new SetSchema(setSchema);
    this.hasTieBreaker = sh.hasTieBreaker();
  }

  test() {
    //console.log(this.matches);
    this.refreshGroupStats();
  }

}

