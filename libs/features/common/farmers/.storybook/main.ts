import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import type { StorybookConfig } from '@storybook/react-vite'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { mergeConfig } from 'vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {}
  },

  viteFinal: async (config) => {
    const fb = fs.readFileSync(path.resolve(__dirname, '../../../../../.env.development'))
    const envConfig = dotenv.parse(fb)

    return mergeConfig(config, {
      plugins: [nxViteTsPaths()],
      define: {
        'process.env': envConfig
      }
    })
  }
}

export default config

// To customize your Vite configuration you can use the viteFinal field.
// Check https://storybook.js.org/docs/react/builders/vite#configuration
// and https://nx.dev/recipes/storybook/custom-builder-configs
