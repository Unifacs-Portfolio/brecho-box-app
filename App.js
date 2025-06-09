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
import Login from './screens/Login';
import ForgotPassword from './screens/ForgotPassword';
import AuthChecker from './screens/welcomeScreen/AuthChecker';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="AuthChecker">
        <Stack.Screen
          name="AuthChecker"
          component={AuthChecker}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Inicio" component={Inicio} 
          options={{ headerShown: false }}/>
        <Stack.Screen name='Registro' component={RegistroScreen} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="Home" component={HomeScreen} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="Quiz" component={Quiz} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="Perfil" component={Perfil} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="ModificarDados" component={ModificarDados} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="Modificacoes" component={Modificacoes} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="ReceitasDeModa" component={ReceitasDeModa} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="DicasDeModa" component={DicasDeModa} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={Login} 
          options={{ headerShown: false }}/>
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} 
          options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
