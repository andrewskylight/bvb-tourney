import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ISet, IMatch, ISetSchema } from '../shared/interfaces';
import { Match } from '../shared/match';
import setSchema from '../api/setSchema.json';

import { UserInputValidator } from './userInputValidator';

@Component({
  selector: 'app-set-dialog',
  templateUrl: './set-dialog.component.html',
  styleUrls: ['./set-dialog.component.css']
})
export class SetDialogComponent {

  private backupSet: Partial<ISet> = { ...this.data.set };
  t1_points = 0;
  t2_points = 0;

  swapTeams = false;
  errorMessage = "";
  uInputValidator: UserInputValidator;
  setSchema: ISetSchema[];

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

  ngOnInit() {
    this.setSchema = setSchema;
    this.uInputValidator = new UserInputValidator(this.data, this.setSchema);
  }


  submit(): void {
    //
    if (this.data.match.sets != undefined &&
      this.data.set.t1_points != undefined &&
      this.data.set.t2_points != undefined &&
      this.data.set.setNo != undefined
    ) {
      this.data.match.sets[this.data.set.setNo - 1].t1_points = this.data.set.t1_points;
      this.data.match.sets[this.data.set.setNo - 1].t2_points = this.data.set.t2_points;
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

  handleInputChange(): void {
    this.errorMessage = this.uInputValidator.validateScore();
  }
}

export interface SetDialogData {
  match: Match;
  set: ISet;
  enableDelete: boolean;
  swapTeams: boolean;
}
