import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorStateComponent } from './error-state';

describe('ErrorStateComponent', () => {
  let fixture: ComponentFixture<ErrorStateComponent>;
  let element: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ErrorStateComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function alert(): HTMLElement | null {
    return element.querySelector('[role="alert"]');
  }

  it('renders the default message in an alert', () => {
    expect(alert()?.textContent).toContain('Something went wrong. Please try again.');
  });

  it('renders a custom message', async () => {
    fixture.componentRef.setInput('message', 'Unable to reach the server.');
    await fixture.whenStable();

    expect(alert()?.textContent).toContain('Unable to reach the server.');
  });

  it('falls back to the default message when bound to undefined', async () => {
    fixture.componentRef.setInput('message', 'Unable to reach the server.');
    await fixture.whenStable();
    fixture.componentRef.setInput('message', undefined);
    await fixture.whenStable();

    expect(alert()?.textContent).toContain('Something went wrong. Please try again.');
  });

  it('emits retry when the "Try again" button is clicked', () => {
    const retry = vi.fn();
    fixture.componentInstance.retry.subscribe(retry);

    const button = element.querySelector('button');
    expect(button?.textContent?.trim()).toBe('Try again');
    button?.click();

    expect(retry).toHaveBeenCalledTimes(1);
  });
});
