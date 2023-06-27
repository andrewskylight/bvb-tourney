import { Component } from '@angular/core';
import { MatchService } from '../match.service';

import { IMatch, IGroup } from '../shared/interfaces';
import { GroupStats } from '../shared/groupStats';

import groupsData from '../api/groups.json';

@Component({
  selector: 'app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.css']
})
export class GroupsComponent {

  public matches: IMatch[];
  public groups: IGroup[];
  public groupsDirect = groupsData;
  public stats: GroupStats;
  private matchSchema = "BO3";    //todo: implement matchSchema

  displayedColumns: string[] = ['Name', 'M', 'W', 'L', 'Pts', 'Set R', 'PW', 'PL', 'Rank'];

  constructor(private matchService: MatchService) { }

  ngOnInit() {
    this.matchService.getGroups()
      .subscribe(groups => this.getGroups(groups));

    this.matchService.getMatches()
      .subscribe(matches => this.getMatches(matches));
  }

  getMatches(matches: IMatch[]) {
    this.matches = matches;
    if (this.groups != undefined && this.stats.isEmpty())
      this.stats.consumeAllMatches(this.matches);
  }

  getGroups(groups: IGroup[]) {
    this.groups = groups;
    this.stats = new GroupStats(this.groups, this.matchSchema);
    if (this.matches != undefined && this.stats.isEmpty())
      this.stats.consumeAllMatches(this.matches);
  }

  test() {
    //alert(this.groups[0].teams[0])
    let stats = new GroupStats(this.groups, this.matchSchema);
    stats.consumeAllMatches(this.matches);
    console.log(stats.toStr());
  }

}

