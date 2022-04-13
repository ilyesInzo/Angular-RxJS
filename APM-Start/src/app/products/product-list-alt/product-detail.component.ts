import { ChangeDetectionStrategy, Component } from '@angular/core';
import { catchError, EMPTY, Subject } from 'rxjs';
import { Supplier } from 'src/app/suppliers/supplier';
import { Product } from '../product';

import { ProductService } from '../product.service';

@Component({
  selector: 'pm-product-detail',
  templateUrl: './product-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductDetailComponent {
  pageTitle = 'Product Detail';
  productSuppliers: Supplier[] | null = null;
  private errorMessageSubject = new Subject<String>();
  errorMessageAction$ = this.errorMessageSubject.asObservable();

  selectedProduct$ = this.productService.selectedProduct$.pipe(
    catchError((err) => {
      this.errorMessageSubject.next(err);
      return EMPTY;
    })
  );

  constructor(private productService: ProductService) {}
}
