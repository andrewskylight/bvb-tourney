export interface ITourney{
  groups: IGroup[];
  matches: IMatch[];
  setSchema: ISetSchema[];
  teams: ITeam[]
}

export interface IMatch {
  id: number;
  group: string;
  team1: string;
  team2: string;
  sets: ISet[];
  editable?:boolean;
}

export interface ISet {
  setNo: number;
  t1_points: number;
  t2_points: number;
}

export interface ISetSchema {
  setNo: number;
  pointCap: number;
  winBy2: boolean;
  tieBreaker: boolean;
}

export interface IGroup {
  group: string;
  teams: string[];
}

export interface ITeam{
  name: string;
  email: string;
}
