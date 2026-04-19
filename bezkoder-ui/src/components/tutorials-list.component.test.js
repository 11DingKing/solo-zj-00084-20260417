import React from 'react';
import { render, screen, fireEvent, wait } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TutorialsList from './tutorials-list.component';
import TutorialDataService from '../services/tutorial.service';

jest.mock('../services/tutorial.service');

const mockTutorials = [
  { id: 1, title: 'React Basics', description: 'Learn React fundamentals', published: true },
  { id: 2, title: 'Node.js Guide', description: 'Learn Node.js basics', published: false },
  { id: 3, title: 'React Advanced', description: 'Advanced React concepts', published: true }
];

const renderWithRouter = (ui) => {
  return render(
    <MemoryRouter>{ui}</MemoryRouter>
  );
};

describe('TutorialsList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders tutorials list and loads data on mount', async () => {
    TutorialDataService.getAll.mockResolvedValue({ data: mockTutorials });
    
    renderWithRouter(<TutorialsList />);
    
    expect(screen.getByText('Tutorials List')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search by title')).toBeInTheDocument();
    
    await wait(() => {
      expect(TutorialDataService.getAll).toHaveBeenCalledTimes(1);
    });
    
    await wait(() => {
      mockTutorials.forEach(tutorial => {
        expect(screen.getByText(tutorial.title)).toBeInTheDocument();
      });
    });
  });

  test('displays empty state when no tutorials are loaded', async () => {
    TutorialDataService.getAll.mockResolvedValue({ data: [] });
    
    renderWithRouter(<TutorialsList />);
    
    await wait(() => {
      expect(TutorialDataService.getAll).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.getByText('Please click on a Tutorial...')).toBeInTheDocument();
  });

  test('allows selecting a tutorial and displays its details', async () => {
    TutorialDataService.getAll.mockResolvedValue({ data: mockTutorials });
    
    renderWithRouter(<TutorialsList />);
    
    await wait(() => {
      expect(TutorialDataService.getAll).toHaveBeenCalledTimes(1);
    });
    
    const tutorialItems = screen.getAllByText('React Basics');
    fireEvent.click(tutorialItems[0]);
    
    expect(screen.getByText('Title:')).toBeInTheDocument();
    expect(screen.getAllByText('React Basics').length).toBe(2);
    expect(screen.getByText('Learn React fundamentals')).toBeInTheDocument();
    expect(screen.getByText('Published')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  test('filters tutorials by title when searching', async () => {
    const searchResults = [
      { id: 1, title: 'React Basics', description: 'Learn React fundamentals', published: true },
      { id: 3, title: 'React Advanced', description: 'Advanced React concepts', published: true }
    ];
    
    TutorialDataService.getAll.mockResolvedValue({ data: mockTutorials });
    TutorialDataService.findByTitle.mockResolvedValue({ data: searchResults });
    
    renderWithRouter(<TutorialsList />);
    
    await wait(() => {
      expect(TutorialDataService.getAll).toHaveBeenCalledTimes(1);
    });
    
    const searchInput = screen.getByPlaceholderText('Search by title');
    fireEvent.change(searchInput, { target: { value: 'React' } });
    
    const searchButton = screen.getByText('Search');
    fireEvent.click(searchButton);
    
    await wait(() => {
      expect(TutorialDataService.findByTitle).toHaveBeenCalledWith('React');
    });
    
    await wait(() => {
      expect(screen.getByText('React Basics')).toBeInTheDocument();
      expect(screen.getByText('React Advanced')).toBeInTheDocument();
      expect(screen.queryByText('Node.js Guide')).not.toBeInTheDocument();
    });
  });

  test('handles API error gracefully when loading tutorials', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    TutorialDataService.getAll.mockRejectedValue(new Error('API Error'));
    
    renderWithRouter(<TutorialsList />);
    
    await wait(() => {
      expect(TutorialDataService.getAll).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.getByText('Please click on a Tutorial...')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
