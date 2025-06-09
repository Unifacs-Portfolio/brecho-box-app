import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Modificacoes({ navigation }) {

  const logout = async () => {
    try {
        // Remove apenas os dados de sessão, mantendo os dados do usuário
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('@currentUserEmail');
        await AsyncStorage.removeItem('@tokenExpiration');
        await AsyncStorage.removeItem('@quizScore');

        console.log('Usuário deslogado');
        navigation.navigate('Login');
    } catch (error) {
        console.error('Erro ao fazer logout:', error);
    }
};

  return (
    <View style={styles.container}>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('ModificarDados')}
        >
          <Text style={styles.optionText}>  Modificar Dados  </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('Perfil')}
        >
          <Text style={styles.optionText}>Voltar para o Perfil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, styles.logoutButton]}
          onPress={logout}
        >
          <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  
  optionsContainer: {
    marginTop: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#eee',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
  },

  optionText: {
    fontSize: 16,
    color: primaryColor,
    fontWeight: '600',
  },

  logoutButton: {
    backgroundColor: primaryColor,
  },

  logoutText: {
    color: '#fff',
  },
});
