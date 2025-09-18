// __mocks__/googleGenaiMock.js

// Mock implementation of the GoogleGenAI class
class MockGoogleGenAI {
  constructor(config) {
    // console.log('MockGoogleGenAI initialized with config:', config);
  }

  get models() {
    return {
      generateImages: jest.fn().mockResolvedValue({
        generatedImages: [{ image: { imageBytes: 'mock_base64_string' } }],
      }),
      generateContent: jest.fn().mockResolvedValue({
        text: 'Mocked AI response text.',
        candidates: [{
          content: {
            parts: [{
              inlineData: {
                mimeType: 'image/png',
                data: 'mock_base64_string_edited'
              }
            }]
          }
        }]
      }),
      generateVideos: jest.fn().mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [{
            video: {
              uri: 'https://mock.storage/video.mp4'
            }
          }]
        }
      }),
    };
  }
  
  get operations() {
    return {
       getVideosOperation: jest.fn().mockResolvedValue({
        done: true,
        response: {
          generatedVideos: [{
            video: {
              uri: 'https://mock.storage/video.mp4'
            }
          }]
        }
      }),
    }
  }
}

module.exports = {
  GoogleGenAI: MockGoogleGenAI,
  Modality: {
    IMAGE: 'IMAGE',
    TEXT: 'TEXT'
  },
};