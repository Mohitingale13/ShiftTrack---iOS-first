const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = process.cwd();
const config = getDefaultConfig(projectRoot);

const projectNodeModules = path.resolve(projectRoot, 'node_modules');

config.resolver.nodeModulesPaths = [projectNodeModules];

config.resolver.extraNodeModules = {
  react: path.resolve(projectNodeModules, 'react'),
  'react-dom': path.resolve(projectNodeModules, 'react-dom'),
  'react-native': path.resolve(projectNodeModules, 'react-native'),
  'react-native-web': path.resolve(projectNodeModules, 'react-native-web'),
};

module.exports = config;