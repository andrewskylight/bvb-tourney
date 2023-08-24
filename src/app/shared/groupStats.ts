import { IGroup, IMatch, ISet } from "./interfaces";
import { ISetSchema } from "./interfaces";
import { SetSchema } from "./setSchema";
import { Match } from "./match";

class TeamWithStats {
  teamName: string;
  winCount = 0;
  lossCount = 0;
  matchCount = 0;
  setsWon = 0;
  setsLost = 0;
  setRatio = 0;
  groupPointCount = 0;
  pointsScored = 0;
  pointsGiven = 0;
  rank = 0;

  constructor(teamName: string) {
    this.teamName = teamName;
  }

  addSet(pointsScored: number, pointsGiven: number) {
    if (pointsScored == 0 && pointsGiven == 0)
      return;

    this.pointsScored += pointsScored;
    this.pointsGiven += pointsGiven;

    if (pointsScored > pointsGiven)
      this.setsWon++;
    else
      this.setsLost++;
  }

  addWin(count = 1) {
    this.winCount += count;
  }

  addLoss(count = 1) {
    this.lossCount += count;
  }

  calcStats() {

    this.matchCount = this.winCount + this.lossCount;

    if (this.setsLost != 0)
      this.setRatio = this.round(this.setsWon / this.setsLost, 2);
    else {
      if (this.setsWon != 0)
        this.setRatio = this.setsWon;
    }

    this.groupPointCount = this.winCount * 3 + this.lossCount;

    this.calcRank();
  }

  calcRank() {
    //rank calc: 0,1234,567
    //0 - group points count
    //1234 - set ratio
    //567 - points 500 - (scored - points_given)
    this.rank =
      this.groupPointCount * 10E7 +
      this.setRatio * 10E4 +
      500 + (this.pointsScored - this.pointsGiven);
  }

  resetStats() {
    this.winCount = 0;
    this.lossCount = 0;
    this.matchCount = 0;
    this.setsWon = 0;
    this.setsLost = 0;
    this.setRatio = 0;
    this.groupPointCount = 0;
    this.pointsScored = 0;
    this.pointsGiven = 0;
    this.rank = 0;
  }

  round(input: number, places: number): number {
    let noOfPlaces = places * 10;
    return Math.round((input + Number.EPSILON) * noOfPlaces) / noOfPlaces;
  }

  toStr(): string {
    let output = "";

    output += this.teamName.padEnd(20, " ") + " ";
    output += this.matchCount.toString().padEnd(2, " ") + " ";
    output += this.winCount.toString().padEnd(2, " ") + " ";
    output += this.lossCount.toString().padEnd(2, " ") + " ";
    output += this.groupPointCount.toString().padEnd(2, " ") + " ";
    output += this.setRatio.toString().padEnd(4, " ") + " ";
    output += this.pointsScored.toString().padEnd(3, " ") + " ";
    output += this.pointsGiven.toString().padEnd(3, " ") + " ";
    output += this.rank;
    output += '\n';

    return output;
  }
}

class GroupWithStats {

  groupName: string;
  teams: TeamWithStats[] = [];
  parent: GroupStats;

  constructor(groupName: string, teamNames: string[], parent: GroupStats) {
    this.addGroup(groupName, teamNames);
    this.parent = parent;
  }

  addGroup(groupName: string, teamNames: string[]) {
    this.groupName = groupName;
    this.addTeams(teamNames);
  }

  addTeams(teamNames: string[]) {
    teamNames.forEach(teamName => {
      this.teams.push(new TeamWithStats(teamName))
    });
  }

  consumeMatch(match: IMatch) {
    /* CHECK CONDITIONS */
    let mh = new Match(match, this.parent.setSchema.setSchema);
    if (!mh.IsMatchFinished())
      return;

    let team1 = this.findTeam(match.team1);
    let team2 = this.findTeam(match.team2);

    let t1_setWonCount = 0;
    let t1_setLostCount = 0;

    for (let set of match.sets) {
      if (set.t1_points == 0 && set.t2_points == 0)
        continue;

      let team1Won = this.consumeSet(team1, team2, set);
      if (team1Won)
        t1_setWonCount++;
      else
        t1_setLostCount++;
    }

    //handle assignment of wins
    // - tie breaker rules => count entire match as win
    if (this.parent.hasTieBreaker()) {
      if (t1_setWonCount > t1_setLostCount) {
        team1.addWin();
        team2.addLoss();
      } else if (t1_setWonCount < t1_setLostCount) {
        team1.addLoss();
        team2.addWin();
      }
      // - no tie breaker => each set won is a win
    } else {
      team1.addWin(t1_setWonCount);
      team1.addLoss(t1_setLostCount);

      team2.addWin(t1_setLostCount);
      team2.addLoss(t1_setWonCount);
    }

  }

  consumeSet(team1: TeamWithStats, team2: TeamWithStats, set: ISet): boolean {
    team1.addSet(set.t1_points, set.t2_points);
    team2.addSet(set.t2_points, set.t1_points);

    return set.t1_points > set.t2_points;
  }

  resetStats(){
    this.teams.forEach( team => team.resetStats());
  }

  findTeam(teamName: string): TeamWithStats {
    return this.teams.find(item => item.teamName === teamName)!;
  }

  sortTeams() {
    this.teams.sort((a, b) => (a.rank < b.rank) ? 1 : -1);
  }

  calcStatsAllTeams() {
    this.teams.forEach(team => team.calcStats());
  }

  toStr(): string {
    let output = "";

    output = "Name                 M  W  L  Pt Rat  PG  PL  Rank \n"
    this.teams.forEach(team => output += team.toStr());

    output += '\n';

    return output;
  }
}

export class GroupStats {
  public groupsStats: GroupWithStats[] = [];
  public setSchema: SetSchema;

  private _isEmpty = true;

  constructor() { }

  setGroups(groups: IGroup[]): void {
    groups.forEach(group => {
      this.groupsStats.push(new GroupWithStats(group.group, group.teams, this))
    });
  }

  resetGroupStats(){
    this.groupsStats.forEach(group => {
      group.resetStats();
    })
  }

  setSetSchema(setSchema: ISetSchema[]) {
    this.setSchema = new SetSchema(setSchema);
  }

  isEmpty(): boolean {
    return this._isEmpty;
  }

  hasTieBreaker(): boolean {
    return this.setSchema.hasTieBreaker();
  }

  consumeAllMatches(matches: IMatch[]) {
    if (this.groupsStats == null || this.groupsStats.length == 0 || this.setSchema == null)
      return;

    this.resetGroupStats()

    for (let match of matches) {
      let groupIndex = match.group.charCodeAt(0) - 65;
      this.groupsStats[groupIndex].consumeMatch(match);
    }

    this.recalcStatsAllTeams();
    this.sortGroupsByRank();
    this._isEmpty = false;
  }

  recalcStatsAllTeams() {
    this.groupsStats.forEach(group => group.calcStatsAllTeams());
  }

  sortGroupsByRank() {
    this.groupsStats.forEach(group => group.sortTeams());
  }

  toStr(): string {
    let output = "";

    this.groupsStats.forEach(group => output += group.toStr());

    return output;
  }
}
