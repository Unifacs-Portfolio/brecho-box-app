import { createStackNavigator } from '@react-navigation/stack';
import Quiz from '../../screens/quiz';

const Stack = createStackNavigator();

export default function OutrosStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="quiz" component={Quiz} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}