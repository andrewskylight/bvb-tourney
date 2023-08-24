import { Component } from '@angular/core';
import { MatchService } from './matches/match.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(public matchService: MatchService){}
}
