import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AuthChecker from '../../screens/welcomeScreen/AuthChecker';
import Inicio from '../../screens/welcomeScreen/Inicio';
import RegistroScreen from '../../screens/welcomeScreen/ResgistroScreen';
import Login from '../../screens/welcomeScreen/Login';
import ForgotPassword from '../../screens/welcomeScreen/ForgotPassword';
import AppTabs from './AppTabs';


const Stack = createNativeStackNavigator();

export default function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="AuthChecker" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AuthChecker" component={AuthChecker} options={{ headerShown: false }} />
      <Stack.Screen name="Inicio" component={Inicio} options={{ headerShown: false }} />
      <Stack.Screen name="Registro" component={RegistroScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} options={{ headerShown: false }} />
      <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}