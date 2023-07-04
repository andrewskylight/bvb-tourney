import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

import { IMatch, IGroup, ITeam, ISetSchema } from './shared/interfaces';
import { Match } from './shared/match';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import groupsData from '../app/api/groups.json';
import teamsData from '../app/api/teams.json';
import setSchema from '../app/api/setSchema.json';
import matchesData from '../app/api/matches.json';

import { AngularFireDatabase } from '@angular/fire/compat/database';


@Injectable({
  providedIn: 'root'
})
export class MatchService {

  public Matches: IMatch[] = matchesData.matches;
  private MatchesUrl = 'https://tourney-f6031-default-rtdb.firebaseio.com/matches.json';  // URL to web api
  private GroupsUrl = 'api/groups';
  //public AuthenticatedEmail = "vladislav.letsko@gmail.com";
  private AuthenticatedEmail = "";
  private AdminEmail = "tsura2003@gmail.com";
  public selectedTeam = "";
  public isDebug = false;

  matches$ = this.db.object('matches').valueChanges() as Observable<IMatch[]>;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),

  };

  constructor(
    private http: HttpClient,
    private db: AngularFireDatabase)
    { }

  setAuthEmail(email: string){
    this.AuthenticatedEmail = email;
  }

  getAuthEmail():string{
    return this.AuthenticatedEmail;
  }

  isAdminLoggedIn():boolean{
    return this.AuthenticatedEmail == this.AdminEmail;
  }

  anyoneLogggedIn():boolean{
    return this.AuthenticatedEmail != "";
  }

  isAdminEmail(email: string):boolean{
    return this.AdminEmail == email;
  }

  getGroups(): Observable<IGroup[]> {
    const output = of(groupsData);
    return output;

    // return this.http.get<Group[]>(this.GroupsUrl)
    // .pipe(
    //   tap(_ => this.log('fetched Groups')),
    //   catchError(this.handleError<Group[]>('getGroups', []))
    // );
  }

  getTeams(): Observable<ITeam[]> {
    const output = of(teamsData);
    return output;
  }

  getSetSchema(): Observable<ISetSchema[]> {
    const output = of(setSchema);
    return output;
  }

  /** GET Matches from the server */
  getMatches(): Observable<IMatch[]> {
    if(this.isDebug){
      const output = of(this.Matches);
      return output;
    }

    return this.http.get<IMatch[]>(this.MatchesUrl)
      .pipe(
        tap(_ => this.log('fetched Matches')),
        catchError(this.handleError<IMatch[]>('getMatches', []))
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
  updateMatch(Match: IMatch): Observable<any> {
    console.log('updateMatch:' +
      Match.id + " " +
      Match.team1 + " " +
      Match.team2 + " " +
      Match.sets[0].t1_points + " " + Match.sets[0].t2_points);

    //const updateURL = this.MatchesUrl + '/' + Match.id + '/sets/0.json';
    //const updateURL = "https://tourney-f6031-default-rtdb.firebaseio.com/matches/0/sets/0/.json";

    const updateURL = "https://tourney-f6031-default-rtdb.firebaseio.com/matches/" + Match.id + "/sets.json";
    return this.http.put(updateURL, Match.sets, this.httpOptions).pipe(
      tap(_ => this.log(`updated Match id=${Match.id}`)),
      catchError(this.handleError<any>('updateMatch'))

      // return this.http.put(this.MatchesUrl, Match, this.httpOptions).pipe(
      //   tap(_ => this.log(`updated Match id=${Match.id}`)),
      //   catchError(this.handleError<any>('updateMatch'))
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
