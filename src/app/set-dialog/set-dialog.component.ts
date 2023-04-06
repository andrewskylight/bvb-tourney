import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Set, Match, SetSchema } from '../shared/interfaces';
import setSchema from '../api/setSchema.json';

@Component({
  selector: 'app-set-dialog',
  templateUrl: './set-dialog.component.html',
  styleUrls: ['./set-dialog.component.css']
})
export class SetDialogComponent {

  private backupSet: Partial<Set> = { ...this.data.set };
  t1_points = 0;
  t2_points = 0;

  swapTeams = false;
  dataInvalid = true;
  s1_hasErrors = false;
  s2_hasErrors = false;
  errorMessage = "";
  uInputValidator: UserInputValidator;
  setSchema : SetSchema[];

  constructor(
    public dialogRef: MatDialogRef<SetDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SetDialogData,
  ) {
    if (data.set.t1_points != undefined)
      this.t1_points = data.set.t1_points;
    if (data.set.t2_points != undefined)
      this.t2_points = data.set.t2_points;

    this.swapTeams = data.swapTeams;
  }

  ngOnInit(){
      this.setSchema = setSchema;

    this.uInputValidator = new UserInputValidator(this.data, this.setSchema);
  }


  submit(): void {
    //
    if (this.data.match.sets != undefined &&
        this.data.set.t1_points != undefined &&
        this.data.set.t2_points  != undefined &&
          this.data.set.setNo != undefined
          ){
      this.data.match.sets[this.data.set.setNo-1].t1_points = this.data.set.t1_points;
      this.data.match.sets[this.data.set.setNo-1].t2_points = this.data.set.t2_points;
    }
    this.dialogRef.close(this.data);
  }

  cancel(): void {
    this.data.set.t1_points = this.backupSet.t1_points!;
    this.data.set.t2_points = this.backupSet.t2_points!;
    this.dialogRef.close(this.data);
  }

  reset(): void {
    this.data.set.t1_points = this.backupSet.t1_points!;
    this.data.set.t2_points = this.backupSet.t2_points!;
    this.errorMessage = "";
  }

  input_changed(): void {

    let matchSchema : string;
    matchSchema = "BO3";

    this.errorMessage = this.uInputValidator.validateScore();
  }
}

export interface SetDialogData {
  match: Match;
  set: Set;
  enableDelete: boolean;
  swapTeams: boolean;
}

class SetData {

  public points1 = -1;
  public points2 = -1;
  public setNo = -1;
  public setPointCap = -1;
  public pointDiff = -1;

  constructor (public data: SetDialogData, public setSchema: SetSchema[]) {
    if (this.data.set.t1_points != null)
      this.points1 = this.data.set.t1_points;
    if (this.data.set.t2_points != null)
      this.points2 = this.data.set.t2_points;


    if (this.data.set.setNo != null)
      this.setNo = this.data.set.setNo;

  this.setPointCap = setSchema[this.setNo-1].pointCap;

  this.pointDiff = Math.abs(this.points1 - this.points2);

  }

  team1PointsTooLow(){
    return this.points1 < 0;
  }
  team2PointsTooLow(){
    return this.points2 < 0;
  }

  team1PointsTooHigh(){
    return this.points1 > this.setPointCap && this.pointGapIsTooLarge();
  }

  team2PointsTooHigh(){
    return this.points2 > this.setPointCap && this.pointGapIsTooLarge();
  }

  bothTeamsBelowPointCap(){
    return this.points1 < this.setPointCap && this.points2 < this.setPointCap;
  }
  bothTeamsHaveSameScore(){
    return this.points1 == this.points2;
  }

  winBy2(){
    return this.setSchema[this.setNo-1].winBy2;
  }

  t1OverPointCap(){
    return this.points1 > this.setPointCap;
  }
  t2OverPointCap(){
    return this.points2 > this.setPointCap;
  }

  atLeastOneTeamOverPointCap(){
    return this.points1 >= this.setPointCap || this.points2 >= this.setPointCap;
  }

  winBy2ConditionMet(){
    return this.pointDiff >=2;
  }

  pointGapIsTooLarge(){
    return this.pointDiff > 2;
  }
}

class UserInputValidator {

  constructor (public data: SetDialogData, public setSchema: SetSchema[]){
  }

  validateScore(): string {
    let setData = new SetData(this.data, this.setSchema);
    let errorMessage = "";

      //points too low
    if (setData.team1PointsTooLow())
      errorMessage = this.data.match.team1 + " points too low.";
    else if (setData.team1PointsTooLow())
      errorMessage = this.data.match.team2 + " points too low.";

      //points too high
    if (setData.team1PointsTooHigh())
      errorMessage = this.data.match.team1 + " points too high.";
    else if (setData.team1PointsTooHigh())
      errorMessage = this.data.match.team2 + " points too high.";

      //check for a 'winner'
    else if (setData.bothTeamsBelowPointCap())
      errorMessage = "no team has reached " + setData.setPointCap;
    else if (setData.bothTeamsHaveSameScore())
      errorMessage = "scores cannot be tied.";

    //win by two errors
    else if (setData.winBy2()){
      if (setData.atLeastOneTeamOverPointCap() && !setData.winBy2ConditionMet()){
          errorMessage = "error: win by 2 in effect; score diff = " + setData.pointDiff;
      }
    }

    //hard cap errors
    else if (!setData.winBy2()){
      if (setData.t1OverPointCap())
        errorMessage = this.data.match.team1 + " points over set cap of " + setData.setPointCap;
      if (setData.t2OverPointCap())
        errorMessage = this.data.match.team2 + " points over set cap of " + setData.setPointCap;
    }

    return errorMessage;
  }

}
