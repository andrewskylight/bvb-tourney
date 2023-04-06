import { Group, Match, Set } from "./interfaces";

//TODO: matchSchema from db

class TeamWithStats {
  teamName: string;
  winCount = 0;
  lossCount = 0;
  matchCount = 0;
  setRatio = 0;
  groupPointCount = 0;
  pointsScored = 0;
  pointsGiven = 0;
  rank = 0;

  constructor(teamName: string){
    this.teamName = teamName;
  }

  addSet(pointsScored: number, pointsGiven: number){
    this.pointsScored += pointsScored;
    this.pointsGiven += pointsGiven;
  }

  addWin(){
    this.winCount++;
  }

  addLoss(){
    this.lossCount++;
  }

  calcStats(){

    this.matchCount = this.winCount + this.lossCount;
    if (this.lossCount != 0)
        this.setRatio = this.round(this.winCount/this.lossCount,2);
    else {
      if (this.winCount != 0)
        this.setRatio = this.winCount;
    }

    this.groupPointCount = this.winCount * 3 + this.lossCount;

    this.calcRank();
  }

  calcRank(){
    //rank calc: 0,1234,567
    //0 - group points count
    //1234 - set ratio
    //567 - points 500 - (scored - points_given)
    this.rank =
      this.groupPointCount * 10E7 +
      this.setRatio * 10E4 +
      500 + (this.pointsScored - this.pointsGiven);
  }



  round(input: number, places: number): number {
    let noOfPlaces = places * 10;
    return Math.round((input + Number.EPSILON) * noOfPlaces) / noOfPlaces;
  }

  toStr(): string {
    let output = "";

    output += this.teamName.padEnd(20," ") + " ";
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

class GroupWithStats{

  groupName: string;
  teams: TeamWithStats[] = [];
  parent: GroupStats;

  constructor(groupName: string, teamNames: string[], parent: GroupStats){
    this.addGroup(groupName, teamNames);
    this.parent = parent;
  }

  addGroup(groupName: string, teamNames: string[]){
    this.groupName = groupName;
    this.addTeams(teamNames);
  }

  addTeams(teamNames: string[]){
    teamNames.forEach(teamName => {
      this.teams.push(new TeamWithStats(teamName))
    });
  }

  consumeMatch(match: Match) {
    let team1 = this.findTeam(match.team1);
    let team2 = this.findTeam(match.team2);

    //againstTeam1
    let setWonCount = 0;
    let setLostCount = 0;

    for (let set of match.sets){
      this.consumeSet(team1, team2, set);

      if (this.parent.getMatchSchema() == "BO3"){
        if (set.t1_points > set.t2_points)
          setWonCount++;
        else
          setLostCount++;
      }
    }

    if (setWonCount > setLostCount){
      team1.addWin();
      team2.addLoss();
    }
    else if(setWonCount < setLostCount){
      team1.addLoss();
      team2.addWin();
    }

  }

  consumeSet(team1: TeamWithStats, team2: TeamWithStats, set: Set){
    team1.addSet(set.t1_points, set.t2_points);
    team2.addSet(set.t2_points, set.t1_points);

    if (this.parent.getMatchSchema() != "BO3"){
      if (set.t1_points > set.t2_points){
        team1.addWin();
        team2.addLoss();
      }
      else{
        team1.addLoss();
        team2.addWin();
      }
    }
  }

  findTeam(teamName: string): TeamWithStats{
    return this.teams.find(item => item.teamName === teamName)!;
  }

  sortTeams(){
    this.teams.sort((a,b) => (a.rank < b.rank) ? 1: -1);
  }

  calcStatsAllTeams(){
    this.teams.forEach(team => team.calcStats());
  }

  toStr(): string{
    let output = "";

    output = "Name                 M  W  L  Pt Rat  PG  PL  Rank \n"
    this.teams.forEach(team => output += team.toStr());

    output += '\n';

    return output;
  }
}

export class GroupStats {
  public groups: GroupWithStats[] = [];
  private _isEmpty = true;
  private matchSchema = "";

  constructor(groups: Group[], matchSchema: string)
    {
      this.matchSchema = matchSchema;
      groups.forEach(group => {
        this.groups.push(new GroupWithStats(group.group, group.teams, this))
      });
    }

  isEmpty(): boolean{
    return this._isEmpty;
  }

  getMatchSchema():string{
    return this.matchSchema;
  }

  consumeAllMatches(matches: Match[]){

    for (let match of matches){
      let groupIndex = match.group.charCodeAt(0) - 65;
      this.groups[groupIndex].consumeMatch(match);
    }

    this.recalcStatsAllTeams();
    this.sortGroupsByRank();
    this._isEmpty = false;

  }

  recalcStatsAllTeams(){
    this.groups.forEach(group => group.calcStatsAllTeams());
  }

  sortGroupsByRank(){
    this.groups.forEach(group => group.sortTeams());
  }

  toStr(): string {
    let output = "";

    this.groups.forEach(group => output += group.toStr());

    return output;
  }
}

let message = 'hello';
console.log(message);
