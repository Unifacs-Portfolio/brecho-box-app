import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthStack from './src/navigation/AuthStack';
import AppTabs from './src/navigation/AppTabs';
import OutrosStack from './src/navigation/OutrosStacks';
import DicasOuReceitasStack from './src/navigation/DicasOuReceitasStack';
import ConfiguracoesStack from './src/navigation/ConfiguracoesStack';

const RootStack = createNativeStackNavigator();

export default function App() {
  return (
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
  );
}