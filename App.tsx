import React from 'react';
import NavigationApp from './src/navigation/NavigationApp';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from '@gluestack-ui/config';

export default function App() {
  return (
    <GluestackUIProvider config={config} >
      <NavigationApp />
    </GluestackUIProvider>
  );
}
