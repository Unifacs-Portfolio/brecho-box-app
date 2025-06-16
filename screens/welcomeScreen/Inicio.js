import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';

import StyledText from '../../src/components/StyledText';

const { height, width } = Dimensions.get('window');

export default function Inicio({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topCurve}>
        <Image
          source={require('../../assets/icon.jpeg')}
          style={styles.logo}
          resizeMode="contain"
        />
        <View style={styles.titleSloganContainer}>
          <StyledText style={styles.title}>BrechóBox</StyledText>
          <StyledText style={styles.slogan}>PENSE FORA DA CAIXA</StyledText>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.outlinedButton}
          onPress={() => navigation.navigate('Registro')}
        >
          <StyledText style={styles.outlinedButtonText}>Crie seu Perfil</StyledText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.filledButton}
          onPress={() => navigation.navigate('Login')}
        >
          <StyledText style={styles.filledButtonText}>Entrar</StyledText>
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
    backgroundColor: primaryColor, 
    height: height * 0.5,
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    justifyContent: 'flex-end', 
    paddingBottom: height * 0.05, 
    paddingTop: height * 0.05, 
  },

  logo: {
    width: width * 0.4, 
    height: width * 0.4,
    marginBottom: 0, 
  },

  titleSloganContainer: {
    alignItems: 'center',
    marginTop: height * 0.01, 
  },

  title: {
    color: '#ffffff',
    fontSize: width * 0.08, 
    fontWeight: 'bold',
    textAlign: 'center',
  },

  slogan: {
    color: '#ffffff',
    fontSize: width * 0.035, 
    fontWeight: '500',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 15,
  },

  buttonContainer: {
    marginTop: height * 0.07,
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
    fontSize: width * 0.045,
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
    fontSize: width * 0.045,
    fontWeight: '700',
  },
});
