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

  public setEditable(team1Email: string, team2Email: string, authEmail: string, adminEmail: string) {
    this.baseMatch.editable = team1Email == authEmail || team2Email == authEmail
      || authEmail == adminEmail;
  }

  public isEditable(): boolean {
    if (this.baseMatch.editable == undefined)
      return true;

    return this.baseMatch.editable;
  }

  public RemoveSetIfNeeded(): void {
    /* CHECK CONDITIONS */
    if (!this.tieBreakerAlreadyAdded() || !this.allMandatorySetsEntered())
      return;

    //tie-breaker has been already added && all mandatory sets has been entered
    let t1Wins = 0;
    let t2Wins = 0;

    //count wins in mandatory sets
    for (let i = 0; i < this.baseMatch.sets.length; i++) {
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
    if(!this.IsMatchFinished() && !this.isLastSetEmpty()) {
      this.AddSet();
    }
  }


  public IsMatchFinished(): boolean {
    if (this.areSetsEmptyOrZero())
      return false;

    if (this.setSchema.hasTieBreaker())
      return this.isThereAWinnerInTieBreakerSets();
    else
      return this.baseMatch.sets.length == this.setSchema.setSchema.length && !this.isLastSetEmpty();

  }

  private areSetsEmptyOrZero(): boolean {
    return this.baseMatch.sets == undefined || this.baseMatch.sets.length == 0;
  }

  private isThereAWinnerInTieBreakerSets(): boolean {
    /* CHECK CONDITIONS */
    if (this.areSetsEmptyOrZero() || this.isLastSetEmpty() || this.sets.length < this.setSchema.setSchema.length -1)
      return false;

    let t1WonSets = 0;
    let t2WonSets = 0;

    let i = 0;
    while (i < this.sets.length) {
      if (this.sets[i].t1_points > this.sets[i].t2_points)
        {t1WonSets++;}
      else if (this.sets[i].t1_points < this.sets[i].t2_points)
        {t2WonSets++;}

      i++;
    }

    if (t1WonSets != t2WonSets)
      return true;
    else
      return false;
  }

  private isLastSetEmpty(): boolean {
    if (this.sets == undefined || this.sets.length == 0)
      return false;
    else
      return this.sets[this.sets.length - 1].IsSetEmpty();
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
