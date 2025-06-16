import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Modificacoes from '../../screens/opções/Modificacoes';
import ModificarDados from '../../screens/opções/ModificarDados'; 
import AjudaScreen from '../../screens/opções/AjudaScreen';
import SobreScreen from '../../screens/opções/SobreScreen';



const Stack = createNativeStackNavigator();

export default function ConfiguracoesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConfiguracoesMain" component={Modificacoes} options={{ headerShown: false }} />
      <Stack.Screen name="ModificarDados" component={ModificarDados} options={{ headerShown: false }} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} options={{ headerShown: false }}  />
      <Stack.Screen name="Sobre" component={SobreScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}