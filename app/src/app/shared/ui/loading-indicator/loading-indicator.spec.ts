import { TestBed } from '@angular/core/testing';

import { LoadingIndicatorComponent } from './loading-indicator';

describe('LoadingIndicatorComponent', () => {
  it('renders a status spinner with text for screen readers', async () => {
    const fixture = TestBed.createComponent(LoadingIndicatorComponent);
    const element: HTMLElement = fixture.nativeElement;
    await fixture.whenStable();

    const status = element.querySelector('[role="status"]');
    expect(status?.classList).toContain('spinner-border');
    expect(status?.querySelector('.visually-hidden')?.textContent).toBe('Loading...');
  });
});
