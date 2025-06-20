// DicasOuReceitasStack.js
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DicasDeModa from '../../screens/dicasEreceitas/DicasDeModa';
import ReceitasDeModa from '../../screens/dicasEreceitas/ReceitasDeModa';
import EscolhaDicasReceitas from '../../screens/dicasEreceitas/EscolhaDicasReceitas';
import CreateDicaScreen from '../../screens/dicasEreceitas/CreateDicaScreen';
import CreateReceitaScreen from '../../screens/dicasEreceitas/CreateReceitaScreen';
import EditReceitaScreen from '../../screens/dicasEreceitas/EditReceitaScreen';
import EditDicaScreen from '../../screens/dicasEreceitas/EditDicaScreen';


const Stack = createNativeStackNavigator();

export default function DicasOuReceitasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EscolhaDicasReceitas" component={EscolhaDicasReceitas} options={{ headerShown: false }} />
      <Stack.Screen name="Dicas" component={DicasDeModa} options={{ headerShown: false }} />
      <Stack.Screen name="Receitas" component={ReceitasDeModa} options={{ headerShown: false }} />
      <Stack.Screen name="CreateReceitas" component={CreateReceitaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateDicas" component={CreateDicaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditReceitas" component={EditReceitaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="EditDicas" component={EditDicaScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
