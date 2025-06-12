import { createStackNavigator } from '@react-navigation/stack';
import Modificacoes from '../../screens/opções/Modificacoes';
import ModificarDados from '../../screens/opções/ModificarDados'; 
import AjudaScreen from '../../screens/opções/AjudaScreen';
import SobreScreen from '../../screens/opções/SobreScreen';

const Stack = createStackNavigator();

export default function ConfiguracoesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ConfiguracoesMain" component={Modificacoes} />
      <Stack.Screen name="ModificarDados" component={ModificarDados} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
      <Stack.Screen name="Sobre" component={SobreScreen} />
    </Stack.Navigator>
  );
}