import { SetDialogData } from "./set-dialog.component";
import { ISetSchema } from "../shared/interfaces";

export class SetData {

  public points1 = -1;
  public points2 = -1;
  public setNo = -1;
  public setPointCap = -1;
  public pointDiff = -1;

  constructor(public data: SetDialogData, public setSchema: ISetSchema[]) {
    if (this.data.set.t1_points != null)
      this.points1 = this.data.set.t1_points;
    if (this.data.set.t2_points != null)
      this.points2 = this.data.set.t2_points;

    if (this.data.set.setNo != null)
      this.setNo = this.data.set.setNo;

    this.setPointCap = setSchema[this.setNo - 1].pointCap;

    this.pointDiff = Math.abs(this.points1 - this.points2);

  }

  team1PointsTooLow() {
    return this.points1 < 0;
  }
  team2PointsTooLow() {
    return this.points2 < 0;
  }

  team1PointsTooHigh() {
    return this.points1 > this.setPointCap && this.pointGapIsTooLarge();
  }

  team2PointsTooHigh() {
    return this.points2 > this.setPointCap && this.pointGapIsTooLarge();
  }

  bothTeamsBelowPointCap() {
    return this.points1 < this.setPointCap && this.points2 < this.setPointCap;
  }
  bothTeamsHaveSameScore() {
    return this.points1 == this.points2;
  }

  winBy2() {
    return this.setSchema[this.setNo - 1].winBy2;
  }

  t1OverPointCap() {
    return this.points1 > this.setPointCap;
  }
  t2OverPointCap() {
    return this.points2 > this.setPointCap;
  }

  atLeastOneTeamOverPointCap() {
    return this.points1 >= this.setPointCap || this.points2 >= this.setPointCap;
  }

  winBy2ConditionMet() {
    return this.pointDiff >= 2;
  }

  pointGapIsTooLarge() {
    return this.pointDiff > 2;
  }

  bothScoresZero():boolean {
    return this.points1 == 0 && this.points2 == 0;
  }
}
