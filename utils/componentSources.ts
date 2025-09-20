// This file uses raw imports, a feature of bundlers like Vite,
// to get the source code of components as strings.
// This allows the AI Test Generator to send the code to the Gemini API.

import AppSource from '../App.tsx?raw';
import AssetLibrarySource from '../components/AssetLibrary.tsx?raw';
import AudioControlSource from '../components/AudioControl.tsx?raw';
import ControlsSource from '../components/Controls.tsx?raw';
import DownloadButtonSource from '../components/DownloadButton.tsx?raw';
import ErrorDisplaySource from '../components/ErrorDisplay.tsx?raw';
import HeaderSource from '../components/Header.tsx?raw';
import LoaderSource from '../components/Loader.tsx?raw';
import ModeToggleSource from '../components/ModeToggle.tsx?raw';
import ModelGeneratorSource from '../components/ModelGenerator.tsx?raw';
import PresetSelectorSource from '../components/PresetSelector.tsx?raw';
import BottomBarSource from '../components/BottomBar.tsx?raw';
import SaveWorldButtonSource from '../components/SaveWorldButton.tsx?raw';
import SceneEditorSource from '../components/SceneEditor.tsx?raw';
import StereoToggleSource from '../components/StereoToggle.tsx?raw';
import VideoDisplaySource from '../components/VideoDisplay.tsx?raw';
import PlaceholderSource from '../components/Placeholder.tsx?raw';
import ARForgeSource from '../pages/ARForge.tsx?raw';
import WorldBuilderSource from '../pages/WorldBuilder.tsx?raw';
import ARPreviewSource from '../components/ARPreview.tsx?raw';
import ARControlsSource from '../components/ARControls.tsx?raw';


export const COMPONENT_SOURCES = {
    'App.tsx': AppSource,
    'AssetLibrary.tsx': AssetLibrarySource,
    'AudioControl.tsx': AudioControlSource,
    'BottomBar.tsx': BottomBarSource,
    'Controls.tsx': ControlsSource,
    'DownloadButton.tsx': DownloadButtonSource,
    'ErrorDisplay.tsx': ErrorDisplaySource,
    'Header.tsx': HeaderSource,
    'Loader.tsx': LoaderSource,
    'ModeToggle.tsx': ModeToggleSource,
    'ModelGenerator.tsx': ModelGeneratorSource,
    'PresetSelector.tsx': PresetSelectorSource,
    'SaveWorldButton.tsx': SaveWorldButtonSource,
    'SceneEditor.tsx': SceneEditorSource,
    'StereoToggle.tsx': StereoToggleSource,
    'VideoDisplay.tsx': VideoDisplaySource,
    'Placeholder.tsx': PlaceholderSource,
    'ARForge.tsx': ARForgeSource,
    'WorldBuilder.tsx': WorldBuilderSource,
    'ARPreview.tsx': ARPreviewSource,
    'ARControls.tsx': ARControlsSource,
};