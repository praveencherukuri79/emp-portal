import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppConfigService {
  // Global stub data toggle - set to false to use real API
  private useStubDataSubject = new BehaviorSubject<boolean>(true);
  public useStubData$ = this.useStubDataSubject.asObservable();

  get useStubData(): boolean {
    return this.useStubDataSubject.value;
  }

  setUseStubData(value: boolean): void {
    this.useStubDataSubject.next(value);
    console.log(`🔧 Stub data ${value ? 'ENABLED' : 'DISABLED'}`);
  }

  toggleStubData(): void {
    this.setUseStubData(!this.useStubData);
  }
}
