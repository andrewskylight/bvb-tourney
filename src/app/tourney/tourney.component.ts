import { Component } from '@angular/core';
import { TourneyService } from './tourney.service';

@Component({
  selector: 'app-tourney',
  templateUrl: './tourney.component.html',
  styleUrls: ['./tourney.component.css']
})
export class TourneyComponent {

  constructor(public tourneyService: TourneyService) {}

}
