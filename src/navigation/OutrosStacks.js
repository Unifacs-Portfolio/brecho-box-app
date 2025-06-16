import { createNativeStackNavigator } from '@react-navigation/native-stack'; 
import Quiz from '../../screens/quiz';


const Stack = createNativeStackNavigator();

export default function OutrosStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="quiz" component={Quiz} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
}