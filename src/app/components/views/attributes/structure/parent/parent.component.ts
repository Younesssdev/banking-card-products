import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-parent',
  templateUrl: './parent.component.html',
  styleUrls: ['./parent.component.css']
})
export class ParentComponent implements OnInit {
    visible : string;
    mandatory : string;
    editable : string;
    multiChoice : string;
    staticLabel : string;
  constructor() { }
  ngOnInit() {
  }

}
