import { ComponentFixture, TestBed } from '@angular/core/testing';
import type { Mock } from 'vitest';

import { PaginationComponent } from './pagination';

describe('PaginationComponent', () => {
  let fixture: ComponentFixture<PaginationComponent>;
  let element: HTMLElement;
  let pageChange: Mock<(page: number) => void>;

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginationComponent);
    element = fixture.nativeElement;
    pageChange = vi.fn();
    fixture.componentInstance.pageChange.subscribe(pageChange);
  });

  async function render(currentPage: number, totalPages: number): Promise<void> {
    fixture.componentRef.setInput('currentPage', currentPage);
    fixture.componentRef.setInput('totalPages', totalPages);
    await fixture.whenStable();
  }

  function button(label: string): HTMLButtonElement {
    const found = element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`);
    if (!found) {
      throw new Error(`Button "${label}" not found`);
    }
    return found;
  }

  function pageNumbers(): string[] {
    return Array.from(element.querySelectorAll('button[aria-label^="Page "]')).map(
      (page) => page.textContent?.trim() ?? '',
    );
  }

  it.each([0, 1])('renders nothing when there are %i total pages', async (totalPages) => {
    await render(1, totalPages);

    expect(element.querySelector('nav')).toBeNull();
  });

  it('renders an accessible navigation with a window of numbered pages', async () => {
    await render(6, 11);

    expect(element.querySelector('nav')?.getAttribute('aria-label')).toBe('Pagination');
    expect(pageNumbers()).toEqual(['4', '5', '6', '7', '8']);
  });

  it('honours maxVisiblePages', async () => {
    fixture.componentRef.setInput('maxVisiblePages', 3);
    await render(6, 11);

    expect(pageNumbers()).toEqual(['5', '6', '7']);
  });

  it('marks only the active page with aria-current', async () => {
    await render(2, 11);

    const current = element.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].textContent?.trim()).toBe('2');
    expect(current[0].closest('li')?.classList).toContain('active');
  });

  it('disables first and previous on the first page', async () => {
    await render(1, 11);

    expect(button('First page').disabled).toBe(true);
    expect(button('Previous page').disabled).toBe(true);
    expect(button('Next page').disabled).toBe(false);
    expect(button('Last page').disabled).toBe(false);
  });

  it('disables next and last on the last page', async () => {
    await render(11, 11);

    expect(button('First page').disabled).toBe(false);
    expect(button('Previous page').disabled).toBe(false);
    expect(button('Next page').disabled).toBe(true);
    expect(button('Last page').disabled).toBe(true);
  });

  it.each([
    ['First page', 1],
    ['Previous page', 4],
    ['Page 7', 7],
    ['Next page', 6],
    ['Last page', 11],
  ])('emits pageChange when "%s" is clicked', async (label, expectedPage) => {
    await render(5, 11);

    button(label).click();

    expect(pageChange).toHaveBeenCalledExactlyOnceWith(expectedPage);
  });

  it('does not emit when the current page is clicked', async () => {
    await render(5, 11);

    button('Page 5').click();

    expect(pageChange).not.toHaveBeenCalled();
  });
});
