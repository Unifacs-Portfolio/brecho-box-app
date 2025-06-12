import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons'; 
export default function Modificacoes({ navigation }) {
  const logout = async () => {
    try {
      // Remove apenas os dados de sessão, mantendo os dados do usuário
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('@currentUserEmail');
      await AsyncStorage.removeItem('@tokenExpiration');
      await AsyncStorage.removeItem('@quizScore');

      console.log('Usuário deslogado');
      navigation.navigate('Login'); // Redireciona para a tela de Login
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()} 
      >
        <Ionicons name="arrow-back" size={24} color={primaryColor} />
      </TouchableOpacity>

      <Text style={styles.title}>Configurações</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('ModificarDados')} 
        >
          <Ionicons name="person-outline" size={20} color={primaryColor} style={styles.buttonIcon} />
          <Text style={styles.optionText}>Dados Pessoais</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('Sobre')} 
        >
          <Ionicons name="information-circle-outline" size={20} color={primaryColor} style={styles.buttonIcon} />
          <Text style={styles.optionText}>Sobre</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('Ajuda')} 
        >
          <Ionicons name="help-circle-outline" size={20} color={primaryColor} style={styles.buttonIcon} />
          <Text style={styles.optionText}>Ajuda</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, styles.logoutButton]}
          onPress={logout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" style={styles.buttonIcon} />
          <Text style={[styles.optionText, styles.logoutText]}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // Um fundo um pouco mais claro para a tela de configurações
    alignItems: 'center',
    paddingTop: 50,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#ffffff44', 
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 40,
  },
  optionsContainer: {
    width: '90%', 
    alignItems: 'center',
  },
  optionButton: {
    backgroundColor: '#fff',
    flexDirection: 'row', 
    alignItems: 'center',
    paddingVertical: 18, 
    paddingHorizontal: 25,
    borderRadius: 15, 
    marginBottom: 15, 
    width: '100%',
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3, 
  },
  buttonIcon: {
    marginRight: 15, 
  },
  optionText: {
    fontSize: 18, 
    color: primaryColor,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: primaryColor,
    marginTop: 20, 
  },
  logoutText: {
    color: '#fff',
  },
});