// __mocks__/threeMock.js
module.exports = {
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    setPixelRatio: jest.fn(),
  })),
  Scene: jest.fn(),
  PerspectiveCamera: jest.fn(),
  AmbientLight: jest.fn(),
  DirectionalLight: jest.fn(),
  GLTFLoader: jest.fn().mockImplementation(() => ({
    load: jest.fn(),
  })),
  Box3: jest.fn().mockImplementation(() => ({
    setFromObject: jest.fn().mockReturnThis(),
    getCenter: jest.fn().mockReturnValue({ x: 0, y: 0, z: 0 }),
  })),
  Vector3: jest.fn(),
  Matrix4: jest.fn().mockImplementation(() => ({
      fromArray: jest.fn().mockReturnThis(),
  })),
  Quaternion: jest.fn().mockImplementation(() => ({
      setFromRotationMatrix: jest.fn().mockReturnThis(),
  })),
};