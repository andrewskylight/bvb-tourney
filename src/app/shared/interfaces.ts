export interface Match {
  id: number,
  group: string;
  team1: string;
  team2: string;
  sets: Set[];
}

export interface Set {
  setNo: number;
  t1_points: number;
  t2_points: number;
}

export interface SetSchema {
  setNo: number;
  pointCap: number;
  winBy2: boolean;
}

export interface Group {
  group: string;
  teams: string[];
}
