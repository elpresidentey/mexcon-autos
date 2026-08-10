import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders nothing when totalPages is 1 or less', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders page numbers for small page count', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders ellipsis for large page count', () => {
    render(<Pagination currentPage={5} totalPages={20} onPageChange={vi.fn()} />);
    
    const ellipses = screen.getAllByText('...');
    expect(ellipses.length).toBeGreaterThan(0);
  });

  it('highlights current page', () => {
    render(<Pagination currentPage={3} totalPages={5} onPageChange={vi.fn()} />);
    
    const currentPageButton = screen.getByText('3');
    expect(currentPageButton).toHaveClass('bg-gradient-to-r');
  });

  it('calls onPageChange when page number is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={1} totalPages={5} onPageChange={onPageChange} />);
    
    const pageButton = screen.getByText('3');
    fireEvent.click(pageButton);
    
    expect(onPageChange).toHaveBeenCalledWith(3);
  });

  it('disables previous button on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} onPageChange={vi.fn()} />);
    
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).toBeDisabled();
  });

  it('enables previous button when not on first page', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    
    const prevButton = screen.getByLabelText('Previous page');
    expect(prevButton).not.toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} onPageChange={vi.fn()} />);
    
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).toBeDisabled();
  });

  it('enables next button when not on last page', () => {
    render(<Pagination currentPage={4} totalPages={5} onPageChange={vi.fn()} />);
    
    const nextButton = screen.getByLabelText('Next page');
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPageChange with previous page when previous button is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    
    const prevButton = screen.getByLabelText('Previous page');
    fireEvent.click(prevButton);
    
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageChange with next page when next button is clicked', () => {
    const onPageChange = vi.fn();
    render(<Pagination currentPage={3} totalPages={5} onPageChange={onPageChange} />);
    
    const nextButton = screen.getByLabelText('Next page');
    fireEvent.click(nextButton);
    
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('shows correct page numbers at start of range', () => {
    render(<Pagination currentPage={2} totalPages={15} onPageChange={vi.fn()} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows correct page numbers in middle of range', () => {
    render(<Pagination currentPage={8} totalPages={15} onPageChange={vi.fn()} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows correct page numbers at end of range', () => {
    render(<Pagination currentPage={14} totalPages={15} onPageChange={vi.fn()} />);
    
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('11')).toBeInTheDocument();
    expect(screen.getByText('14')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('has proper ARIA labels for navigation', () => {
    render(<Pagination currentPage={2} totalPages={5} onPageChange={vi.fn()} />);
    
    expect(screen.getByLabelText('Previous page')).toBeInTheDocument();
    expect(screen.getByLabelText('Next page')).toBeInTheDocument();
  });
});
