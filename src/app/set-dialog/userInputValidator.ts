import { SetDialogData } from "./set-dialog.component";
import { ISetSchema } from "../shared/interfaces";
import { SetData } from "./setData";

export class UserInputValidator {

  constructor(public data: SetDialogData, public setSchema: ISetSchema[]) {
  }

  validateScore(): string {
    let setData = new SetData(this.data, this.setSchema);
    let errorMessage = "";

    //points too low
    if (setData.team1PointsTooLow())
      errorMessage = this.data.match.team1 + " invalid points.";
    else if (setData.team2PointsTooLow())
      errorMessage = this.data.match.team2 + " invalid points.";

    //points too high
    if (setData.team1PointsTooHigh())
      errorMessage = this.data.match.team1 + " points too high (cap " + setData.setPointCap + ").";
    else if (setData.team2PointsTooHigh())
      errorMessage = this.data.match.team2 + " points too high (cap " + setData.setPointCap + ").";

    //check for a 'winner'
    else if (setData.bothTeamsBelowPointCap())
      errorMessage = "no team has reached " + setData.setPointCap;
    else if (setData.bothTeamsHaveSameScore())
      errorMessage = "scores cannot be tied.";

    //win by two errors
    else if (setData.winBy2()) {
      if (setData.atLeastOneTeamOverPointCap() && !setData.winBy2ConditionMet()) {
        errorMessage = "win by 2 in effect; score diff = " + setData.pointDiff;
      }
    }

    //hard cap errors
    else if (!setData.winBy2()) {
      if (setData.t1OverPointCap())
        errorMessage = this.data.match.team1 + " points over set cap of " + setData.setPointCap;
      if (setData.t2OverPointCap())
        errorMessage = this.data.match.team2 + " points over set cap of " + setData.setPointCap;
    }

    return errorMessage;
  }

}
