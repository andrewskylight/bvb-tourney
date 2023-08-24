import { Component } from '@angular/core';
import { MatchService } from '../matches/match.service';

import { IMatch, IGroup, ISetSchema } from '../shared/interfaces';
import { GroupStats } from '../shared/groupStats';
import matchesData from '../api/matches.json';

import { SetSchema } from '../shared/setSchema';

import groupsData from '../api/groups.json';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent {

  matches: IMatch[];
  matchSubscription: Subscription;
  public groups: IGroup[];
  public setSchema: ISetSchema[];
  public groupsDirect = groupsData;
  public stats: GroupStats = new GroupStats();
  public hasTieBreaker = false;
  public matches$: Observable<IMatch[]>;

  displayedColumns: string[] = ['Name', 'M', 'W', 'L', 'Pts', 'Set R', 'PW', 'PL', 'Rank'];

  constructor(private matchService: MatchService) { }

  ngOnInit() {
    this.matchService.getSetSchema()
    .subscribe(setSchema => this.setSetSchema(setSchema));

    this.matchService.getGroups()
    .subscribe(groups => this.setGroups(groups));

    this.matchService.fetchMatches();

    this.matchSubscription = this.matchService.matchesChanged.subscribe(
        matches => this.onMatchesChanged(matches));
  }

  ngOnDestroy(){
    this.matchSubscription.unsubscribe();
  }

  refreshGroupStats():void {
    this.stats.consumeAllMatches(this.matches);
  }

  onMatchesChanged(matches: IMatch[]):void{
    this.matches = matches;
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

