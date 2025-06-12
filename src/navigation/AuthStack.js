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
      <Stack.Screen name="AuthChecker" component={AuthChecker} />
      <Stack.Screen name="Inicio" component={Inicio} />
      <Stack.Screen name="Registro" component={RegistroScreen} />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      <Stack.Screen name="AppTabs" component={AppTabs} />
    </Stack.Navigator>
  );
}