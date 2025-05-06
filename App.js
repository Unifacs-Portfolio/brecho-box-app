import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Inicio from './screens/welcomeScreen/Inicio';
import HomeScreen from './screens/HomeScreen';
import Quiz from './screens/quiz';
import Perfil from './screens/perfil/Perfil';
import Notificacoes from './screens/perfil/Notificacoes';
import ModificarDados from './screens/perfil/ModificarDados';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={Inicio} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={Quiz} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="Notificacoes" component={Notificacoes} />
        <Stack.Screen name="ModificarDados" component={ModificarDados} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
