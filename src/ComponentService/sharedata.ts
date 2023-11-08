import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SharedService {
  private dataToShare = new BehaviorSubject<any>(null);
  dataToShare$ = this.dataToShare.asObservable();
  constructor() {
    this.dataToShare.next(null);
  }
  shareData(data: any) {
    this.dataToShare.next(data);
  }

}

