import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Text, View, StyleSheet } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function Fonts() {
  const [loaded, error] = useFonts({
    'Roboto-Black': require('../assets/fonts/Roboto-Black.ttf'),
    'LibreBodoni-Regular': require('../assets/fonts/LibreBodoni-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Isso é um título</Text>
      <Text style={styles.texto}>Isso é um texto. Nullam non massa a nibh ultricies porttitor. Vivamus nibh justo, rhoncus eu erat sit amet, facilisis dapibus erat. Nulla quis ligula nec quam blandit pretium. Maecenas vulputate odio nisi, et placerat neque tristique et. Mauris vitae efficitur mauris, eget molestie urna. Maecenas neque risus, pretium lacinia nulla vitae, ultricies ornare purus. Sed sagittis tortor in leo pretium pretium. Maecenas aliquet pellentesque nibh, at condimentum elit posuere blandit.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titulo: {
    paddingTop: 100, 
    fontFamily: 'Roboto-Black', 
    fontSize: 30 
  },
  texto: { 
    fontFamily: 'LibreBodoni-Regular', 
    fontSize: 18, 
    padding: 10, 
    flex: 1,
    justifyContent: 'center', 
  }
  
});

