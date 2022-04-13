import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {
  throwError,
  Observable,
  of,
  tap,
  concatMap,
  mergeMap,
  switchMap,
  delay,
} from 'rxjs';
import { Supplier } from './supplier';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  suppliersUrl = 'api/suppliers';

  supplierWithConcatMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log(id)),
    concatMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`)) // will wait until the observer complete and process the request in order
  );

  supplierWithMergeMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log(id)),
    mergeMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  // With swithMap if the next values is immeted before the request is completed it will jump/(unsubscribe from the previous) and process the next
  // in our exemple only the last value is processed
  supplierWithSwithMap$ = of(1, 5, 8).pipe(
    tap((id) => console.log(id)),
    switchMap((id) => this.http.get<Supplier>(`${this.suppliersUrl}/${id}`))
  );

  constructor(private http: HttpClient) {
    /*this.supplierWithConcatMap$.subscribe((o) =>
      console.log('concat result', o)
    );
    this.supplierWithMergeMap$.subscribe((o) => console.log('merge result', o));
    this.supplierWithSwithMap$.subscribe((o) =>
      console.log('switch result', o)
    );*/
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.message}`;
    }
    console.error(err);
    return throwError(() => errorMessage);
  }
}
