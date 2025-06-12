import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image,
  Dimensions  
} from 'react-native';


const { height } = Dimensions.get('window');

export default function Inicio({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topCurve}>
        <Image
          source={require('../../assets/icon.jpeg')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>BrechóBox</Text>
        <Text style={styles.slogan}>PENSE FORA DA CAIXA</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.outlinedButton}
          onPress={() => navigation.navigate('Registro')}
        >
          <Text style={styles.outlinedButtonText}>Crie seu Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filledButton}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.filledButtonText}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const primaryColor = '#473da1'; // Roxo base do logo 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  topCurve: {
    backgroundColor: '#473da1',
    height: '50%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    paddingTop: 60, 
  },

  logo: {
    width: 200,
    height: 200,
    marginBottom: 10,
  },

  slogan: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    marginTop: 5,
  },

  buttonContainer: {
    marginTop: 60,
    alignItems: 'center',
  },

  outlinedButton: {
    borderColor: primaryColor,
    borderWidth: 2,
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    width: '80%',
  },

  outlinedButtonText: {
    color: primaryColor,
    fontSize: 18,
    fontWeight: '700',
  },

  filledButton: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.02,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    width: '80%',
  },

  filledButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  title: {
    color: '#ffffff',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 10,
  },
});

