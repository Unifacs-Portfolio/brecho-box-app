import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from '@rneui/themed';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text h4 style={{ marginBottom: 20 }}>Bem-vindo à Home</Text>

      <Button title="Receitas"
        onPress={() => navigation.navigate('ReceitasDeModa')}
        buttonStyle={styles.button} 
        />
        <Button
        title="Dicas"
        onPress={() => navigation.navigate('DicasDeModa')}
        buttonStyle={styles.button}
      />
      <Button
        title="Quiz"
        onPress={() => navigation.navigate('Quiz')}
        buttonStyle={styles.button}
      />
      <Button 
        title="Perfil"
        onPress={() => navigation.navigate('Perfil')}
        buttonStyle={styles.button}
      />
      <Button
        title="Início"
        onPress={() => navigation.navigate('Inicio')}
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
