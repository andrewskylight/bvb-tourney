import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatchService } from '../matches/match.service';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.css']
})
export class LogoutComponent {
  constructor(private matchService: MatchService,private router: Router){}

  ngOnInit(){
    this.Logout();
  }

  Logout(){
    localStorage.removeItem('userEmail');
    this.matchService.setAuthEmail("");
    this.router.navigate(['/login']);
  }
}
