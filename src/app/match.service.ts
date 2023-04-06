import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { Match, Group } from './shared/interfaces';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import groupsData from '../app/api/groups.json';


@Injectable({
  providedIn: 'root'
})
export class MatchService {

  private MatchesUrl = 'api/matches';  // URL to web api
  private GroupsUrl = 'api/groups';

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(
    private http: HttpClient)
    { }



  getGroups(): Observable<Group[]> {
    const output = of(groupsData);
    return output;

    // return this.http.get<Group[]>(this.GroupsUrl)
    // .pipe(
    //   tap(_ => this.log('fetched Groups')),
    //   catchError(this.handleError<Group[]>('getGroups', []))
    // );
  }


  /** GET Matches from the server */
  getMatches(): Observable<Match[]> {
    return this.http.get<Match[]>(this.MatchesUrl)
      .pipe(
        tap(_ => this.log('fetched Matches')),
        catchError(this.handleError<Match[]>('getMatches', []))
      );
  }

  /** GET Match by id. Return `undefined` when id not found */
  getMatchNo404<Data>(id: number): Observable<Match> {
    const url = `${this.MatchesUrl}/?id=${id}`;
    return this.http.get<Match[]>(url)
      .pipe(
        map(Matches => Matches[0]), // returns a {0|1} element array
        tap(h => {
          const outcome = h ? 'fetched' : 'did not find';
          this.log(`${outcome} Match id=${id}`);
        }),
        catchError(this.handleError<Match>(`getMatch id=${id}`))
      );
  }

  /** GET Match by id. Will 404 if id not found */
  getMatch(id: number): Observable<Match> {
    const url = `${this.MatchesUrl}/${id}`;
    return this.http.get<Match>(url).pipe(
      tap(_ => this.log(`fetched Match id=${id}`)),
      catchError(this.handleError<Match>(`getMatch id=${id}`))
    );
  }

  /* GET Matches whose name contains search term */
  searchMatches(term: string): Observable<Match[]> {
    if (!term.trim()) {
      // if not search term, return empty Match array.
      return of([]);
    }
    return this.http.get<Match[]>(`${this.MatchesUrl}/?name=${term}`).pipe(
      tap(x => x.length ?
         this.log(`found Matches matching "${term}"`) :
         this.log(`no Matches matching "${term}"`)),
      catchError(this.handleError<Match[]>('searchMatches', []))
    );
  }

  //////// Save methods //////////

  /** POST: add a new Match to the server */
  addMatch(Match: Match): Observable<Match> {
    return this.http.post<Match>(this.MatchesUrl, Match, this.httpOptions).pipe(
      tap((newMatch: Match) => this.log(`added Match w/ id=${newMatch.id}`)),
      catchError(this.handleError<Match>('addMatch'))
    );
  }

  /** DELETE: delete the Match from the server */
  deleteMatch(id: number): Observable<Match> {
    const url = `${this.MatchesUrl}/${id}`;

    return this.http.delete<Match>(url, this.httpOptions).pipe(
      tap(_ => this.log(`deleted Match id=${id}`)),
      catchError(this.handleError<Match>('deleteMatch'))
    );
  }

  /** PUT: update the Match on the server */
  updateMatch(Match: Match): Observable<any> {
    console.log('updateMatch:' +
      Match.id + " " +
      Match.team1 + " " +
      Match.team2 + " " +
      Match.sets[0].t1_points + " " + Match.sets[0].t2_points);

    return this.http.put(this.MatchesUrl, Match, this.httpOptions).pipe(
      tap(_ => this.log(`updated Match id=${Match.id}`)),
      catchError(this.handleError<any>('updateMatch'))
    );
  }

  /** Log a HeroService message with the MessageService */
  private log(message: string) {
    //this.messageService.add(`HeroService: ${message}`);
    console.log(message);
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {

    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
