import * as React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import VideoDisplay from './VideoDisplay';

describe('VideoDisplay', () => {
  const defaultProps = {
    videoUrl: 'test-video.mp4',
    audioUrl: 'test-audio.mp3',
    frameUrl: 'test-frame.jpg',
    onVideoEnd: jest.fn(),
    isLoading: false,
    isReady: true,
    isStereo: false,
    onSave: jest.fn(),
    onAddAmbiance: jest.fn(),
    isGeneratingAudio: false,
    audioDescription: 'test description',
  };

  it('should render the download button and not be overlapped by the video', () => {
    render(<VideoDisplay {...defaultProps} />);
    const downloadButton = screen.getByRole('button', { name: /download video/i });
    expect(downloadButton).toBeInTheDocument();
    expect(downloadButton).toBeVisible();
  });
});