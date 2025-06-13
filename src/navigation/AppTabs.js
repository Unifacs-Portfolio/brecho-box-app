import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../../screens/HomeScreen';
import Perfil from '../../screens/perfil/Perfil';
import DicasOuReceitasStack from './DicasOuReceitasStack';
import ConfiguracoesStack from './ConfiguracoesStack';

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#464193',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 80,
          paddingTop: 15
        },
        headerShown: false
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="home" size={size} color={color} />), }} />
      <Tab.Screen name="Dicas/Receitas" component={DicasOuReceitasStack} options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="list" size={size} color={color} />), }} />
      <Tab.Screen name="Perfil" component={Perfil} options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="person" size={size} color={color} />), }} />
      <Tab.Screen name="Configurações" component={ConfiguracoesStack} options={{ tabBarIcon: ({ color, size }) => (<Ionicons name="settings" size={size} color={color} />), }} />
    </Tab.Navigator>
  );
}
