import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonService {

  constructor() { }

  saveText(jsonObj:any, filename?:string){
    let a = document.createElement('a');

    let text = JSON.stringify(jsonObj,null,'\t');

    if (filename == undefined)
      filename = 'bvb.json';

    a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
    a.setAttribute('download', filename);
    a.click()
  }
}
