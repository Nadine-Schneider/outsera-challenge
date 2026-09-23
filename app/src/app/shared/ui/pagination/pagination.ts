import { Component, computed, input, output } from '@angular/core';

import { visiblePageRange } from '../../utils/pagination';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.html',
})
export class PaginationComponent {
  readonly currentPage = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly maxVisiblePages = input(5);
  readonly pageChange = output<number>();

  protected readonly pages = computed(() =>
    visiblePageRange(this.currentPage(), this.totalPages(), this.maxVisiblePages()),
  );
  protected readonly isFirst = computed(() => this.currentPage() <= 1);
  protected readonly isLast = computed(() => this.currentPage() >= this.totalPages());

  protected goTo(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage()) {
      this.pageChange.emit(page);
    }
  }
}
