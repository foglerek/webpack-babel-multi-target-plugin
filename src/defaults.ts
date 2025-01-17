import { BabelPresetOptions } from 'babel-loader'

import { StandardTargetOptionsMap } from './babel.target.options'

export const DEFAULT_COREJS_VERSION = 3

export const DEFAULT_BABEL_PRESET_OPTIONS: BabelPresetOptions = {
  modules: false,
  useBuiltIns: 'usage',
  corejs: DEFAULT_COREJS_VERSION,
}

export const DEFAULT_BABEL_PLUGINS: string[] = [
  '@babel/plugin-syntax-dynamic-import',
  '@babel/plugin-transform-runtime',
]

export const DEFAULT_MODERN_BROWSERS = [
  // The last two versions of each browser, excluding versions
  // that don't support <script type="module">.
  'last 2 Chrome versions', 'not Chrome < 60',
  'last 2 Safari versions', 'not Safari < 10.1',
  'last 2 iOS versions', 'not iOS < 10.3',
  'last 2 Firefox versions', 'not Firefox < 54',
  'last 2 Edge versions', 'not Edge < 15',
]

export const DEFAULT_LEGACY_BROWSERS = [
  '> 1%',
  'last 2 versions',
  'Firefox ESR',
  'IE 11',
]

export const DEFAULT_BROWSERS: { [profile: string]: string[] } = {
  modern: DEFAULT_MODERN_BROWSERS,
  legacy: DEFAULT_LEGACY_BROWSERS,
}

export const DEFAULT_TARGET_INFO: StandardTargetOptionsMap = {
  modern: {
    tagAssetsWithKey: true,
    browsers: DEFAULT_MODERN_BROWSERS,
    esModule: true,
    noModule: false,
  },
  legacy: {
    tagAssetsWithKey: false,
    browsers: DEFAULT_LEGACY_BROWSERS,
    esModule: false,
    noModule: true,
  },
}
