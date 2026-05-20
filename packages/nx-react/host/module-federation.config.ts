import { ModuleFederationConfig } from '@nx/module-federation';

const config: ModuleFederationConfig = {
  name: 'host',
  remotes: ['remote1', 'remote2', 'remote3'],
  shared: (libraryName, defaultConfig) => {
    if (libraryName === 'react' || libraryName === 'react-dom' || libraryName.startsWith('react/') || libraryName.startsWith('react-dom/')) {
      return { ...defaultConfig, eager: true, singleton: true, requiredVersion: false, strictVersion: false };
    }
    return defaultConfig;
  },
};

export default config;
