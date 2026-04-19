import React from 'react';
import { render, screen, fireEvent, wait } from '@testing-library/react';
import Tutorial from './tutorial.component';
import TutorialDataService from '../services/tutorial.service';

jest.mock('../services/tutorial.service');

const mockTutorial = {
  id: 1,
  title: 'Test Tutorial',
  description: 'Test Description',
  published: false
};

const mockUpdatedTutorial = {
  ...mockTutorial,
  title: 'Updated Tutorial',
  description: 'Updated Description'
};

const mockPublishedTutorial = {
  ...mockTutorial,
  published: true
};

const createMockHistory = () => ({
  push: jest.fn()
});

const createMockMatch = (id = '1') => ({
  params: { id }
});

const renderWithProps = (props = {}) => {
  const defaultProps = {
    match: createMockMatch(),
    history: createMockHistory(),
    ...props
  };
  return render(<Tutorial {...defaultProps} />);
};

describe('Tutorial Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loads and displays tutorial data on mount', async () => {
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    await wait(() => {
      expect(screen.getByText('Tutorial')).toBeInTheDocument();
      expect(screen.getByLabelText('Title').value).toBe('Test Tutorial');
      expect(screen.getByLabelText('Description').value).toBe('Test Description');
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully when loading tutorial', async () => {
    TutorialDataService.get.mockRejectedValue(new Error('Tutorial not found'));
    
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.getByText('Tutorial')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('updates title input when user types', async () => {
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    const titleInput = screen.getByLabelText('Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });
    
    expect(titleInput.value).toBe('New Title');
  });

  test('updates description input when user types', async () => {
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    const descriptionInput = screen.getByLabelText('Description');
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    
    expect(descriptionInput.value).toBe('New Description');
  });

  test('calls update API and shows success message when Update button is clicked', async () => {
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    TutorialDataService.update.mockResolvedValue({ data: mockUpdatedTutorial });
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    
    fireEvent.change(titleInput, { target: { value: 'Updated Tutorial' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
    
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);
    
    await wait(() => {
      expect(TutorialDataService.update).toHaveBeenCalledWith(1, {
        id: 1,
        title: 'Updated Tutorial',
        description: 'Updated Description',
        published: false
      });
    });
    
    await wait(() => {
      expect(screen.getByText('The tutorial was updated successfully!')).toBeInTheDocument();
    });
  });

  test('calls delete API and navigates to tutorials list when Delete button is clicked', async () => {
    const mockHistory = createMockHistory();
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    TutorialDataService.delete.mockResolvedValue({ data: {} });
    
    renderWithProps({ history: mockHistory });
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await wait(() => {
      expect(TutorialDataService.delete).toHaveBeenCalledWith(1);
    });
    
    await wait(() => {
      expect(mockHistory.push).toHaveBeenCalledWith('/tutorials');
    });
  });

  test('calls update API and toggles status when Publish button is clicked', async () => {
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    TutorialDataService.update.mockResolvedValue({ data: mockPublishedTutorial });
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    expect(screen.getByText('Pending')).toBeInTheDocument();
    const publishButton = screen.getByText('Publish');
    fireEvent.click(publishButton);
    
    await wait(() => {
      expect(TutorialDataService.update).toHaveBeenCalledWith(1, {
        id: 1,
        title: 'Test Tutorial',
        description: 'Test Description',
        published: true
      });
    });
    
    await wait(() => {
      expect(screen.getByText('Published')).toBeInTheDocument();
    });
  });

  test('calls update API and toggles status when UnPublish button is clicked', async () => {
    TutorialDataService.get.mockResolvedValue({ data: mockPublishedTutorial });
    TutorialDataService.update.mockResolvedValue({ data: mockTutorial });
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    expect(screen.getByText('Published')).toBeInTheDocument();
    const unPublishButton = screen.getByText('UnPublish');
    fireEvent.click(unPublishButton);
    
    await wait(() => {
      expect(TutorialDataService.update).toHaveBeenCalledWith(1, {
        id: 1,
        title: 'Test Tutorial',
        description: 'Test Description',
        published: false
      });
    });
    
    await wait(() => {
      expect(screen.getByText('Pending')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully when updating tutorial', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    TutorialDataService.update.mockRejectedValue(new Error('API Error'));
    
    renderWithProps();
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    const updateButton = screen.getByText('Update');
    fireEvent.click(updateButton);
    
    await wait(() => {
      expect(TutorialDataService.update).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.queryByText('The tutorial was updated successfully!')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });

  test('handles API error gracefully when deleting tutorial', async () => {
    const mockHistory = createMockHistory();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    TutorialDataService.get.mockResolvedValue({ data: mockTutorial });
    TutorialDataService.delete.mockRejectedValue(new Error('API Error'));
    
    renderWithProps({ history: mockHistory });
    
    await wait(() => {
      expect(TutorialDataService.get).toHaveBeenCalledWith('1');
    });
    
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    
    await wait(() => {
      expect(TutorialDataService.delete).toHaveBeenCalledTimes(1);
    });
    
    expect(mockHistory.push).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
