import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
} from '@angular/core';

import {
  catchError,
  combineLatest,
  EMPTY,
  map,
  Observable,
  startWith,
  Subject,
} from 'rxjs';
import { ProductCategory } from '../product-categories/product-category';
import { ProductCategoryService } from '../product-categories/product-category.service';

import { Product } from './product';
import { ProductService } from './product.service';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent {
  pageTitle = 'Product List';
  errorMessage = '';
  categories: ProductCategory[] = [];
  selectedCategoryId = 1;

  private categorySelectedSubject = new Subject<number>();
  categorySelectedAction = this.categorySelectedSubject.asObservable();

  categories$ = this.productCategoryService.categories$;

  products$ = combineLatest([
    this.productService.productsWithCategories$,
    this.categorySelectedAction.pipe(startWith(0)), // or remove this pipe and use behaviourSubject instead
  ]).pipe(
    map(([products, categoryId]) =>
      products.filter((product) =>
        categoryId ? product.categoryId === categoryId : true
      )
    ),
    catchError((err) => {
      this.errorMessage = err;
      return EMPTY;
    })
  );

  constructor(
    private productService: ProductService,
    private productCategoryService: ProductCategoryService
  ) {}

  onAdd(): void {
    console.log('Not yet implemented');
  }

  onSelected(categoryId: string): void {
    //this.selectedCategoryId = +categoryId;
    this.categorySelectedSubject.next(+categoryId);
  }
}
