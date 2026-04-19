import React from 'react';
import { render, screen, fireEvent, wait } from '@testing-library/react';
import AddTutorial from './add-tutorial.component';
import TutorialDataService from '../services/tutorial.service';

jest.mock('../services/tutorial.service');

const mockTutorial = {
  id: 1,
  title: 'Test Tutorial',
  description: 'Test Description',
  published: false
};

describe('AddTutorial Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders add tutorial form with title and description inputs', () => {
    render(<AddTutorial />);
    
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('updates title and description inputs when user types', () => {
    render(<AddTutorial />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    
    fireEvent.change(titleInput, { target: { value: 'New Tutorial' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    
    expect(titleInput.value).toBe('New Tutorial');
    expect(descriptionInput.value).toBe('New Description');
  });

  test('submits form successfully with valid title and description', async () => {
    TutorialDataService.create.mockResolvedValue({ data: mockTutorial });
    
    render(<AddTutorial />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(titleInput, { target: { value: 'Test Tutorial' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await wait(() => {
      expect(TutorialDataService.create).toHaveBeenCalledWith({
        title: 'Test Tutorial',
        description: 'Test Description'
      });
    });
    
    await wait(() => {
      expect(screen.getByText('You submitted successfully!')).toBeInTheDocument();
      expect(screen.getByText('Add')).toBeInTheDocument();
    });
  });

  test('does not submit form when title is empty', async () => {
    render(<AddTutorial />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(titleInput, { target: { value: '' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await wait(() => {
      expect(TutorialDataService.create).not.toHaveBeenCalled();
    });
    
    expect(screen.queryByText('You submitted successfully!')).not.toBeInTheDocument();
  });

  test('does not submit form when title contains only whitespace', async () => {
    render(<AddTutorial />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(titleInput, { target: { value: '   ' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await wait(() => {
      expect(TutorialDataService.create).not.toHaveBeenCalled();
    });
    
    expect(screen.queryByText('You submitted successfully!')).not.toBeInTheDocument();
  });

  test('resets form after clicking Add button on success screen', async () => {
    TutorialDataService.create.mockResolvedValue({ data: mockTutorial });
    
    render(<AddTutorial />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(titleInput, { target: { value: 'Test Tutorial' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await wait(() => {
      expect(screen.getByText('You submitted successfully!')).toBeInTheDocument();
    });
    
    const addButton = screen.getByText('Add');
    fireEvent.click(addButton);
    
    expect(screen.getByLabelText('Title').value).toBe('');
    expect(screen.getByLabelText('Description').value).toBe('');
    expect(screen.getByText('Submit')).toBeInTheDocument();
  });

  test('handles API error gracefully when submitting tutorial', async () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    TutorialDataService.create.mockRejectedValue(new Error('API Error'));
    
    render(<AddTutorial />);
    
    const titleInput = screen.getByLabelText('Title');
    const descriptionInput = screen.getByLabelText('Description');
    const submitButton = screen.getByText('Submit');
    
    fireEvent.change(titleInput, { target: { value: 'Test Tutorial' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(submitButton);
    
    await wait(() => {
      expect(TutorialDataService.create).toHaveBeenCalledTimes(1);
    });
    
    expect(screen.queryByText('You submitted successfully!')).not.toBeInTheDocument();
    consoleSpy.mockRestore();
  });
});
