// __mocks__/mediaPipeMock.js
module.exports = {
  FilesetResolver: {
    forVisionTasks: jest.fn().mockResolvedValue({}),
  },
  FaceLandmarker: {
    createFromOptions: jest.fn().mockResolvedValue({
      detectForVideo: jest.fn().mockReturnValue({
        faceLandmarks: [],
        facialTransformationMatrixes: [],
      }),
    }),
  },
};