import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {
  catchError,
  combineLatest,
  map,
  merge,
  Observable,
  scan,
  shareReplay,
  Subject,
  tap,
  throwError,
} from 'rxjs';

import { Product } from './product';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { SupplierService } from '../suppliers/supplier.service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private productsUrl = 'api/products';
  private suppliersUrl = 'api/suppliers';

  private selectedProductSubject = new Subject<number>();
  selectedProductAction$ = this.selectedProductSubject.asObservable();

  private insertProductSubject = new Subject<Product>();
  insertProductAction$ = this.insertProductSubject.asObservable();

  products$ = this.http.get<Product[]>(this.productsUrl).pipe(
    map((products) =>
      products.map(
        (product) =>
          ({
            ...product,
            price: product.price ? product.price * 1.5 : 0,
          } as Product)
      )
    ),
    tap((data) => console.log('Products: ', JSON.stringify(data))),
    catchError(this.handleError)
  );

  productsWithCategories$ = combineLatest([
    this.products$,
    this.productCategory.categories$,
  ]).pipe(
    map(([products, categories]) =>
      products.map(
        (product) =>
          ({
            ...product,
            category: categories.find((c) => c.id === product.categoryId),
          } as Product)
      )
    )
  );

  selectedProduct$ = combineLatest([
    this.productsWithCategories$.pipe(shareReplay(1)),
    this.selectedProductAction$,
  ]).pipe(
    map(([products, selectedProjectId]) =>
      products.find((product) => product.id === selectedProjectId)
    ),
    catchError(this.handleError)
  );

  productsWithAdd$ = merge(
    this.productsWithCategories$,
    this.insertProductAction$
  ).pipe(
    scan(
      (acc, value) => (value instanceof Array ? [...value] : [...acc, value]),
      [] as Product[]
    )
  );

  addProduct(product?: Product) {
    this.insertProductSubject.next(product ?? this.fakeProduct());
  }

  addSelection(productId: number) {
    this.selectedProductSubject.next(productId);
  }

  constructor(
    private http: HttpClient,
    private productCategory: ProductCategoryService,
    private supplierService: SupplierService
  ) {}

  private fakeProduct(): Product {
    return {
      id: 42,
      productName: 'Another One',
      productCode: 'TBX-0042',
      description: 'Our new product',
      price: 8.9,
      categoryId: 3,
      // category: 'Toolbox',
      quantityInStock: 30,
    };
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
