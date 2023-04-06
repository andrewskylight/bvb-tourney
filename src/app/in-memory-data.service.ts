import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Match } from '../app/shared/interfaces';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    const matches = [
      {
        "id": 1,
          "group": "A",
          "team1": "Barry/Tsura",
          "team2": "Dima/Val",
          "sets":
          [
            {
                "setNo": 1,
                "t1_points": 21,
                "t2_points": 16
            },
            {
                "setNo": 2,
                "t1_points": 21,
                "t2_points": 18
            }
        ]
      },

      {
          "id": 2,
          "group": "A",
          "team1": "Danil/Andriy",
          "team2": "Dima/Val",
          "sets": [{"setNo": 1,"t1_points": 15,"t2_points": 21},
                  {"setNo": 2,"t1_points": 21,"t2_points": 18},
                  {"setNo": 3,"t1_points": 15,"t2_points": 11}]
      },
      {
          "id": 3,
          "group": "A",
          "team1": "Danil/Andriy",
          "team2": "Bogdan/VladKh",
          "sets":
          [
            {
                "setNo": 1,
                "t1_points": 21,
                "t2_points": 10
            },
            {
                "setNo": 2,
                "t1_points": 21,
                "t2_points": 15
            }
        ]
      },
      {
        "id": 4,
        "group": "A",
        "team1": "Danil/Andriy",
        "team2": "Barry/Tsura",
        "sets": [{"setNo": 1, "t1_points": 21, "t2_points": 16 },
                {"setNo": 2, "t1_points": 21, "t2_points": 18 }]
      },
      {
        "id": 5,
          "group": "A",
          "team1": "Barry/Tsura",
          "team2": "Bogdan/VladKh",
          "sets":
          [
            {
                "setNo": 1,
                "t1_points": 21,
                "t2_points": 10
            },
            {
                "setNo": 2,
                "t1_points": 19,
                "t2_points": 21
            },
            {
                "setNo": 3,
                "t1_points": 15,
                "t2_points": 11
            }
        ]
      },
      {
        "id": 6,
          "group": "A",
          "team1": "Dima/Val",
          "team2": "Bogdan/VladKh",
          "sets":
          [
            {
                "setNo": 1,
                "t1_points": 21,
                "t2_points": 10
            },
            {
                "setNo": 2,
                "t1_points": 10,
                "t2_points": 21
            },
            {
                "setNo": 3,
                "t1_points": 15,
                "t2_points": 11
            }
        ]
      },
      {
        "id": 7,
        "group": "B",
        "team1": "Fedya/VladK",
        "team2": "Art/VladL",
        "sets":
        []
    }];


    return {matches};
  }

  // Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  genId(matches: Match[]): number {
    return matches.length > 0 ? Math.max(...matches.map(match => match.id)) + 1 : 11;
  }
}
