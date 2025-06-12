// DicasOuReceitasStack.js
import { createStackNavigator } from '@react-navigation/stack';
import DicasDeModa from '../../screens/dicasEreceitas/DicasDeModa';
import ReceitasDeModa from '../../screens/dicasEreceitas/ReceitasDeModa';
import EscolhaDicasReceitas from '../../screens/dicasEreceitas/EscolhaDicasReceitas';

const Stack = createStackNavigator();

export default function DicasOuReceitasStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="EscolhaDicasReceitas" component={EscolhaDicasReceitas} />
      <Stack.Screen name="DicasDeModa" component={DicasDeModa} />
      <Stack.Screen name="ReceitasDeModa" component={ReceitasDeModa} />
    </Stack.Navigator>
  );
}
