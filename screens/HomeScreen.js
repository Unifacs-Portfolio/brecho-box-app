import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from '@rneui/themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {

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
      <Text h4 style={{ marginBottom: 20 }}>Bem Vindo!</Text>

      <Button title="Receitas"
        onPress={() => navigation.navigate('ReceitasDeModa')}
        buttonStyle={styles.button} 
        />
        <Button
        title="   Dicas   "
        onPress={() => navigation.navigate('DicasDeModa')}
        buttonStyle={styles.button}
      />
      <Button
        title="    Quiz    "
        onPress={() => navigation.navigate('Quiz')}
        buttonStyle={styles.button}
      />
      <Button 
        title="   Perfil   "
        onPress={() => navigation.navigate('Perfil')}
        buttonStyle={styles.button}
      />
      <Button
        title="     Sair     "
        onPress={logout}
        buttonStyle={[styles.button, { backgroundColor: '#555' }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#464193',
    borderRadius: 30,
    marginVertical: 10,
    paddingHorizontal: 30,
  },
});

