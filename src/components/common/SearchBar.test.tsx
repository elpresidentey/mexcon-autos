import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders with placeholder text', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} placeholder="Search parts..." />);
    
    const input = screen.getByPlaceholderText('Search parts...');
    expect(input).toBeInTheDocument();
  });

  it('displays the current value', () => {
    const onChange = vi.fn();
    render(<SearchBar value="engine" onChange={onChange} />);
    
    const input = screen.getByDisplayValue('engine');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when text is entered', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    
    const input = screen.getByRole('textbox', { name: /search/i });
    fireEvent.change(input, { target: { value: 'brake' } });
    
    expect(onChange).toHaveBeenCalledWith('brake');
  });

  it('shows clear button when value is present', () => {
    const onChange = vi.fn();
    render(<SearchBar value="test" onChange={onChange} />);
    
    const clearButton = screen.getByLabelText(/clear search/i);
    expect(clearButton).toBeInTheDocument();
  });

  it('hides clear button when value is empty', () => {
    const onChange = vi.fn();
    render(<SearchBar value="" onChange={onChange} />);
    
    const clearButton = screen.queryByLabelText(/clear search/i);
    expect(clearButton).not.toBeInTheDocument();
  });

  it('clears the value when clear button is clicked', () => {
    const onChange = vi.fn();
    const onClear = vi.fn();
    render(<SearchBar value="test" onChange={onChange} onClear={onClear} />);
    
    const clearButton = screen.getByLabelText(/clear search/i);
    fireEvent.click(clearButton);
    
    expect(onChange).toHaveBeenCalledWith('');
    expect(onClear).toHaveBeenCalled();
  });

  it('has search icon', () => {
    const onChange = vi.fn();
    const { container } = render(<SearchBar value="" onChange={onChange} />);
    
    // Check for the magnifying glass icon SVG
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });
});
