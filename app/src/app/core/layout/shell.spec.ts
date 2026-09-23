import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { Shell } from './shell';

@Component({ template: '<p>stub page</p>' })
class StubPage {}

describe('Shell', () => {
  let fixture: ComponentFixture<Shell>;
  let element: HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([
          { path: 'dashboard', component: StubPage },
          { path: 'movies', component: StubPage },
        ]),
      ],
    });

    fixture = TestBed.createComponent(Shell);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  function navLinks(): HTMLAnchorElement[] {
    return Array.from(element.querySelectorAll<HTMLAnchorElement>('nav a'));
  }

  function toggleButton(): HTMLButtonElement {
    const button = element.querySelector<HTMLButtonElement>('button[aria-controls="app-sidebar"]');
    if (!button) {
      throw new Error('Menu toggle button not found');
    }
    return button;
  }

  it('renders the application title in the header', () => {
    expect(element.querySelector('header')?.textContent).toContain('Frontend Angular Test');
  });

  it('renders menu links to the dashboard and to the movies list', () => {
    const links = navLinks().map((link) => ({
      label: link.textContent?.trim(),
      href: link.getAttribute('href'),
    }));

    expect(links).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'List', href: '/movies' },
    ]);
  });

  it('highlights only the link of the active route', async () => {
    await TestBed.inject(Router).navigateByUrl('/movies');
    await fixture.whenStable();

    const [dashboardLink, moviesLink] = navLinks();
    expect(moviesLink.classList).toContain('active');
    expect(moviesLink.getAttribute('aria-current')).toBe('page');
    expect(dashboardLink.classList).not.toContain('active');
    expect(dashboardLink.hasAttribute('aria-current')).toBe(false);
  });

  it('renders the routed page inside the content area', async () => {
    await TestBed.inject(Router).navigateByUrl('/dashboard');
    await fixture.whenStable();

    expect(element.querySelector('main')?.textContent).toContain('stub page');
  });

  it('toggles the collapsible sidebar with the menu button', async () => {
    const sidebar = element.querySelector('#app-sidebar');
    expect(toggleButton().getAttribute('aria-expanded')).toBe('false');
    expect(sidebar?.classList).not.toContain('is-open');

    toggleButton().click();
    await fixture.whenStable();

    expect(toggleButton().getAttribute('aria-expanded')).toBe('true');
    expect(sidebar?.classList).toContain('is-open');
  });

  it('closes the sidebar after a menu link is chosen', async () => {
    toggleButton().click();
    await fixture.whenStable();

    navLinks()[1].click();
    await fixture.whenStable();

    expect(toggleButton().getAttribute('aria-expanded')).toBe('false');
    expect(element.querySelector('#app-sidebar')?.classList).not.toContain('is-open');
  });
});
