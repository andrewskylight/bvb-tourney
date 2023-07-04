import { Component } from '@angular/core';
import { MatchService } from '../match.service';

import { IMatch, IGroup, ISetSchema } from '../shared/interfaces';
import { GroupStats } from '../shared/groupStats';
import matchesData from '../api/matches.json';

import { SetSchema } from '../shared/setSchema';

import groupsData from '../api/groups.json';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent {

  public matches: IMatch[];
  public groups: IGroup[];
  public setSchema: ISetSchema[];
  public groupsDirect = groupsData;
  public stats: GroupStats;
  public hasTieBreaker = false;
  public matches$: Observable<IMatch[]>;

  displayedColumns: string[] = ['Name', 'M', 'W', 'L', 'Pts', 'Set R', 'PW', 'PL', 'Rank'];

  constructor(private matchService: MatchService) { }

  ngOnInit() {
    this.matchService.getSetSchema()
    .subscribe(setSchema => this.setSetSchema(setSchema));

    this.matchService.getGroups()
      .subscribe(groups => this.setGroups(groups));

    //  this.matches$ = this.matchService.matches$;

    // this.matches$.subscribe(
    //   matches => {
    //     if (this.groups != undefined && this.stats.isEmpty())
    //       this.stats.consumeAllMatches(matches);
    //   }
    // )
    this.matchService.getMatches()
      .subscribe(matches => this.setMatches(matches));
  }

  setMatches(matches: IMatch[]) {
    this.matches = matches;
    if (this.groups != undefined && this.stats.isEmpty())
      this.stats.consumeAllMatches(this.matches);
  }

  setGroups(groups: IGroup[]) {
    this.groups = groups;
    this.stats = new GroupStats(this.groups, this.setSchema);
    if (this.matches != undefined && this.stats.isEmpty())
      this.stats.consumeAllMatches(this.matches);
  }

  setSetSchema(setSchema: ISetSchema[]){
    this.setSchema = setSchema;
    let sh = new SetSchema(setSchema);
    this.hasTieBreaker = sh.hasTieBreaker();
  }

  test() {
    // let stats = new GroupStats(this.groups, this.matchSchema);
    // stats.consumeAllMatches(this.matches);
    // console.log(stats.toStr());
  }

}

