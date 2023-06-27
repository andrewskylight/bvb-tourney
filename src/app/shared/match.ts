import { IMatch, ISet, ISetSchema } from '../shared/interfaces';
import { Set } from '../shared/set';
import { SetSchema } from './setSchema';

export class Match implements IMatch {
  baseMatch: IMatch;
  id: number;
  group: string;
  team1: string;
  team2: string;
  sets: Set[] = [];
  setSchema: SetSchema;

  constructor(match: IMatch, setSchema: ISetSchema[]) {
    this.baseMatch = match;
    this.id = match.id;
    this.group = match.group;
    this.team1 = match.team1;
    this.team2 = match.team2;

    for (let i = 0; i < match.sets.length; i++) {
      this.sets.push(new Set(match.sets[i].setNo, match.sets[i].t1_points, match.sets[i].t2_points));
    }

    this.setSchema = new SetSchema(setSchema);

  }

  public setSetSchema(setSchema: ISetSchema[]) {
    this.setSchema = new SetSchema(setSchema);
  }

  private removeSetIfNeeded(): void{

    /* CHECK CONDITIONS */
    if(!this.tieBreakerAlreadyAdded() ||!this.allMandatorySetsEntered())
      return;

    //tie-breaker has been already added && all mandatory sets has been entered
    let t1Wins = 0;
    let t2Wins = 0;

    //count wins in mandatory sets
    for (let i = 0; i < this.baseMatch.sets.length; i++){
      if (this.setSchema.setSchema[i].tieBreaker)
        continue;

      if (this.baseMatch.sets[i].t1_points > this.baseMatch.sets[i].t2_points)
        t1Wins++;
      else
        t2Wins++;
    }

    if (t1Wins > t2Wins || t1Wins < t2Wins)
      this.baseMatch.sets.pop();
  }

  public AddSetIfNeeded(): void {
    this.removeSetIfNeeded();

    /* CHECK CONDITIONS */
    if (!this.allMandatorySetsEntered()) {
      this.AddSet();
      return;
    }

    //if setSchema does not contain a tieBraker or tie breaker already added
    if (!this.canAddTieBreakerSet())
      return;

    let t1Wins = 0;
    let t2Wins = 0;

    [t1Wins, t2Wins] = this.getWinCount();

    if (t1Wins == t2Wins)
      this.AddSet();
  }

  private getWinCount(): [number, number] {
    let t1Wins = 0;
    let t2Wins = 0;

    //loop through each set
    for (let i = 0; i < this.sets.length; i++) {
      let t1_points = this.sets[i].t1_points;
      let t2_points = this.sets[i].t2_points;

      if (t1_points > t2_points)
        t1Wins++;
      else
        t2Wins++;
    }

    return [t1Wins, t2Wins];
  }

  private allMandatorySetsEntered(): boolean {
    return this.baseMatch.sets.length >= this.getMandatorySets()
  }

  private getMandatorySets(): number {
    if (this.setSchema.hasTieBreaker())
      return this.setSchema.setSchema.length - 1;
    else
      return this.setSchema.setSchema.length - 2;
  }

  private AddSet(): void {
    this.baseMatch.sets.push(new Set(this.sets.length + 1));
  }

  private AddTieBreakerSet(): void {
    let tieBreakerSetIndex = this.setSchema.getTieBreakerSetIndex();
    this.baseMatch.sets.push(new Set(tieBreakerSetIndex + 1));
  }

  private canAddTieBreakerSet(): boolean {
    let tieBreakerSetIndex = this.setSchema.getTieBreakerSetIndex();
    if (tieBreakerSetIndex == -1)
      return false;
    else
      return this.sets.length - 1 < tieBreakerSetIndex;
  }

  private tieBreakerAlreadyAdded(): boolean {
    return this.setSchema.hasTieBreaker() && this.baseMatch.sets.length == this.setSchema.setSchema.length;
  }
}
