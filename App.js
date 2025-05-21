import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Inicio from './screens/welcomeScreen/Inicio';
import RegistroScreen from './screens/ResgistroScreen';
import HomeScreen from './screens/HomeScreen';
import Quiz from './screens/quiz';
import Perfil from './screens/perfil/Perfil';
import ModificarDados from './screens/perfil/ModificarDados';
import Modificacoes from './screens/perfil/Modificacoes';
import ReceitasDeModa from './screens/ReceitasDeModa'; 
import DicasDeModa from './screens/DicasDeModa';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Inicio" component={Inicio} />
        <Stack.Screen name='Registro' component={RegistroScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Quiz" component={Quiz} />
        <Stack.Screen name="Perfil" component={Perfil} />
        <Stack.Screen name="ModificarDados" component={ModificarDados} />
        <Stack.Screen name="Modificacoes" component={Modificacoes} />
        <Stack.Screen name="ReceitasDeModa" component={ReceitasDeModa} />
        <Stack.Screen name="DicasDeModa" component={DicasDeModa} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
