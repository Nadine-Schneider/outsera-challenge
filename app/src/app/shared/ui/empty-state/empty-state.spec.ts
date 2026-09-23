import { TestBed } from '@angular/core/testing';

import { EmptyStateComponent } from './empty-state';

describe('EmptyStateComponent', () => {
  it('renders the message', async () => {
    const fixture = TestBed.createComponent(EmptyStateComponent);
    const element: HTMLElement = fixture.nativeElement;
    fixture.componentRef.setInput('message', 'Search for a year to see its winners.');
    await fixture.whenStable();

    expect(element.textContent?.trim()).toBe('Search for a year to see its winners.');
  });
});
