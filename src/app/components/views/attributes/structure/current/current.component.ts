import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-current',
  templateUrl: './current.component.html',
  styleUrls: ['./current.component.css']
})
export class CurrentComponent implements OnInit {
    visible : string;
    mandatory : string;
    editable : string;
    multiChoice : string;
    staticLabel : string;
  constructor() { }

  ngOnInit() {
    
  }

}
