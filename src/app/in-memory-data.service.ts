import { Injectable } from '@angular/core';
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { IMatch } from '../app/shared/interfaces';
import { Match } from './shared/match';
import { SetSchema } from './shared/setSchema';

import matchesData from '../app/api/matches.json';
import setSchemaData from '../app/api/setSchema.json';

import { JsonService } from 'src/json.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class InMemoryDataService implements InMemoryDbService {



  createDb() {
    const matchesJSON = matchesData;
    const setSchemaJSON = setSchemaData;

    let matches: Match[] = [];

    for (let i=0;i<matchesJSON.length;i++){
      matches.push(new Match(matchesJSON[i],setSchemaJSON));
    }

    return {matches};
  }
  //   return {matches};
  // }

  // Overrides the genId method to ensure that a hero always has an id.
  // If the heroes array is empty,
  // the method below returns the initial number (11).
  // if the heroes array is not empty, the method below returns the highest
  // hero id + 1.
  genId(matches: Match[]): number {
    return matches.length > 0 ? Math.max(...matches.map(match => match.id)) + 1 : 11;
  }
}
