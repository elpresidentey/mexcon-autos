import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tabs, TabList, Tab, TabPanel } from './Tabs';

const renderTabs = () =>
  render(
    <Tabs defaultValue="specs">
      <TabList aria-label="Product details">
        <Tab value="specs">Specs</Tab>
        <Tab value="fitment">Fitment</Tab>
        <Tab value="reviews">Reviews</Tab>
      </TabList>
      <TabPanel value="specs">Specs content</TabPanel>
      <TabPanel value="fitment">Fitment content</TabPanel>
      <TabPanel value="reviews">Reviews content</TabPanel>
    </Tabs>,
  );

describe('Tabs', () => {
  it('shows the default tab panel and hides the others', () => {
    renderTabs();
    expect(screen.getByText('Specs content')).toBeInTheDocument();
    expect(screen.queryByText('Fitment content')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Specs' })).toHaveAttribute('aria-selected', 'true');
  });

  it('switches panels on tab click', () => {
    renderTabs();
    fireEvent.click(screen.getByRole('tab', { name: 'Fitment' }));
    expect(screen.getByText('Fitment content')).toBeInTheDocument();
    expect(screen.queryByText('Specs content')).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Fitment' })).toHaveAttribute('aria-selected', 'true');
  });

  it('supports arrow-key navigation', () => {
    renderTabs();
    const tablist = screen.getByRole('tablist');
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(screen.getByRole('tab', { name: 'Fitment' })).toHaveFocus();
    expect(screen.getByRole('tab', { name: 'Fitment' })).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(screen.getByRole('tab', { name: 'Reviews' })).toHaveFocus();
  });

  it('links tab and panel ids', () => {
    renderTabs();
    const tab = screen.getByRole('tab', { name: 'Specs' });
    const panel = screen.getByRole('tabpanel');
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });
});
