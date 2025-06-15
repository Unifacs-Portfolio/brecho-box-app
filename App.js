import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// Importações dos seus stacks e telas
import AuthStack from './src/navigation/AuthStack';
import AppTabs from './src/navigation/AppTabs';
import OutrosStack from './src/navigation/OutrosStacks';
import DicasOuReceitasStack from './src/navigation/DicasOuReceitasStack';
import ConfiguracoesStack from './src/navigation/ConfiguracoesStack';


SplashScreen.preventAutoHideAsync();

const RootStack = createNativeStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Carrega todas as fontes Poppins.
        // Caminhos corrigidos assumindo que App.js está na raiz do projeto.
        await Font.loadAsync({
          'Poppins-Regular': require('./assets/fonts/Poppins-Regular.ttf'),
          'Poppins-Bold': require('./assets/fonts/Poppins-Bold.ttf'),
          'Poppins-SemiBold': require('./assets/fonts/Poppins-SemiBold.ttf'),
          'Poppins-Medium': require('./assets/fonts/Poppins-Medium.ttf'),
          'Poppins-Light': require('./assets/fonts/Poppins-Light.ttf'),
          'Poppins-ExtraLight': require('./assets/fonts/Poppins-ExtraLight.ttf'),
          'Poppins-Thin': require('./assets/fonts/Poppins-Thin.ttf'),
          'Poppins-Black': require('./assets/fonts/Poppins-Black.ttf'),
          'Poppins-Italic': require('./assets/fonts/Poppins-Italic.ttf'),
          'Poppins-BoldItalic': require('./assets/fonts/Poppins-BoldItalic.ttf'),
          'Poppins-SemiBoldItalic': require('./assets/fonts/Poppins-SemiBoldItalic.ttf'),
          'Poppins-MediumItalic': require('./assets/fonts/Poppins-MediumItalic.ttf'),
          'Poppins-LightItalic': require('./assets/fonts/Poppins-LightItalic.ttf'),
          'Poppins-ExtraLightItalic': require('./assets/fonts/Poppins-ExtraLightItalic.ttf'),
          'Poppins-ThinItalic': require('./assets/fonts/Poppins-ThinItalic.ttf'),
          'Poppins-BlackItalic': require('./assets/fonts/Poppins-BlackItalic.ttf'),
        });
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
      <NavigationContainer>
        <StatusBar backgroundColor="#464193" barStyle="light-content" />
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          <RootStack.Screen name="AuthStack" component={AuthStack} />
          <RootStack.Screen name="AppTabs" component={AppTabs} />
          <RootStack.Screen name="OutrosStack" component={OutrosStack} />
          <RootStack.Screen name="DicasOuReceitasStack" component={DicasOuReceitasStack} />
          <RootStack.Screen name="ConfiguracoesStack" component={ConfiguracoesStack} />
        </RootStack.Navigator>
      </NavigationContainer>
    </View>
  );
}
