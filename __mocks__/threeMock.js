// __mocks__/threeMock.js
module.exports = {
  WebGLRenderer: jest.fn().mockImplementation(() => ({
    setSize: jest.fn(),
    render: jest.fn(),
    setPixelRatio: jest.fn(),
    xr: {
      enabled: false,
      getController: jest.fn().mockReturnValue({
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        add: jest.fn(),
        children: [],
      }),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      setReferenceSpaceType: jest.fn(),
      getSession: jest.fn().mockReturnValue(null)
    },
    setAnimationLoop: jest.fn(),
    dispose: jest.fn(),
  })),
  Scene: jest.fn().mockImplementation(() => ({
    add: jest.fn(),
  })),
  PerspectiveCamera: jest.fn().mockImplementation(() => ({
    position: { x: 0, y: 0, z: 0 },
    layers: {
      enable: jest.fn(),
    }
  })),
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
  XRButton: {
    createButton: jest.fn().mockReturnValue(document.createElement('button')),
  },
  PlaneGeometry: jest.fn(),
  MeshBasicMaterial: jest.fn(),
  Mesh: jest.fn().mockImplementation(() => ({
    layers: {
      set: jest.fn(),
    },
    position: {
      set: jest.fn(),
    },
  })),
  Group: jest.fn().mockImplementation(() => ({
    position: {
      x: 0,
      y: 0,
      z: 0,
      set: jest.fn(),
    },
    add: jest.fn(),
  })),
  CanvasTexture: jest.fn(),
  Raycaster: jest.fn().mockImplementation(() => ({
    ray: {
      origin: {
        setFromMatrixPosition: jest.fn(),
      },
      direction: {
        set: jest.fn().mockReturnThis(),
        applyMatrix4: jest.fn(),
      },
    },
    intersectObject: jest.fn().mockReturnValue([]),
  })),
  Line: jest.fn().mockImplementation(() => ({
    scale: { z: 0 },
    material: {
        color: {
            set: jest.fn()
        }
    }
  })),
  BufferGeometry: jest.fn().mockImplementation(() => ({
    setFromPoints: jest.fn(),
  })),
  VideoTexture: jest.fn(),
};