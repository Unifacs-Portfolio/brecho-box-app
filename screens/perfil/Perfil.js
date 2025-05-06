import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';

export default function Perfil({ navigation }) {
 

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={require('../../assets/icon.jpg')} 
          style={styles.profileImage}
        />
        <Text style={styles.userName}>Nome do Usuário</Text>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('ModificarDados')}
        >
          <Text style={styles.optionText}>Modificar Dados</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.optionButton}
          onPress={() => navigation.navigate('Notificacoes')}
        >
          <Text style={styles.optionText}>Notificações</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.optionButton, styles.logoutButton]}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={[styles.optionText, styles.logoutText]}>Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.optionText, styles.logoutText]}>⮕</Text>
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
  },
  profileHeader: {
    alignItems: 'center',
    marginTop: 50,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: primaryColor,
  },
  optionsContainer: {
    marginTop: 40,
    paddingHorizontal: 30,
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
  button: {
    backgroundColor: '#464193',
    borderRadius: 50,
    fontWeight: '900',
    fontSize: 900,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    top: 20,
    left: 300,
    transform: [{ rotate: '180deg' }],
  },
});
