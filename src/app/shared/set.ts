import { ISet } from '../shared/interfaces';

export class Set implements ISet {
  setNo: number;
  t1_points: number;
  t2_points: number;

  constructor(setNo: number, t1_points: number = 0, t2_points: number = 0) {
    this.setNo = setNo;
    this.t1_points = t1_points;
    this.t2_points = t2_points;
  }

  IsSetEmpty(): boolean {
    return this.t1_points == 0 && this.t2_points == 0;
  }
}
