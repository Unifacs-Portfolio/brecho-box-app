// DicasOuReceitasStack.js
import { createStackNavigator } from '@react-navigation/stack';
import DicasDeModa from '../../screens/dicasEreceitas/DicasDeModa';
import ReceitasDeModa from '../../screens/dicasEreceitas/ReceitasDeModa';
import EscolhaDicasReceitas from '../../screens/dicasEreceitas/EscolhaDicasReceitas';
import CreateDicaScreen from '../../screens/dicasEreceitas/CreateDicaScreen';
import CreateReceitaScreen from '../../screens/dicasEreceitas/CreateReceitaScreen';


const Stack = createStackNavigator();

export default function DicasOuReceitasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EscolhaDicasReceitas" component={EscolhaDicasReceitas} options={{ headerShown: false }} />
      <Stack.Screen name="Dicas" component={DicasDeModa} options={{ headerShown: false }} />
      <Stack.Screen name="Receitas" component={ReceitasDeModa} options={{ headerShown: false }} />
      <Stack.Screen name="CreateReceitas" component={CreateReceitaScreen} options={{ headerShown: false }} />
      <Stack.Screen name="CreateDicas" component={CreateDicaScreen} options={{ headerShown: false }} />

    </Stack.Navigator>
  );
}
