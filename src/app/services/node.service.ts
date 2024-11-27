import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class NodeService {
 
  constructor(private http: HttpClient) { }

  getFiles():Observable<any> {
     // Set your HttpHeaders to ask for XML.
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type':  'application/xml, application/json', //<- To SEND XML
        'Accept':  'application/xml, application/json',       //<- To ask for XML
        responseType: 'blob'
      }),
      responseType : 
         'blob' as 'json'
    };
    return this.http.get<any>('assets/files.xml', httpOptions )
    .pipe(map(res=>{
      const parser = new DOMParser();
      parser.parseFromString(res, 'text/xml');
    }));
      
  }
}
