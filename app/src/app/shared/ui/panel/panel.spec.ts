import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { PanelComponent } from './panel';

@Component({
  imports: [PanelComponent],
  template: `<app-panel title="Top 3 studios with winners"><p>projected body</p></app-panel>`,
})
class HostComponent {}

describe('PanelComponent', () => {
  let element: HTMLElement;

  beforeEach(async () => {
    const fixture = TestBed.createComponent(HostComponent);
    element = fixture.nativeElement;
    await fixture.whenStable();
  });

  it('renders the title as a heading', () => {
    expect(element.querySelector('h2')?.textContent?.trim()).toBe('Top 3 studios with winners');
  });

  it('projects the content into the card body', () => {
    expect(element.querySelector('.card-body p')?.textContent).toBe('projected body');
  });
});
