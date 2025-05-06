import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const notificacoes = [
  { id: '1', titulo: 'Bem-vindo ao BrechóBox!' },
  { id: '2', titulo: 'Sua conta foi atualizada com sucesso.' },
];

export default function Notificacoes({ navigation }) {
  return (
    <View style={styles.container}>
    <View style={styles.container}>
      <Text style={styles.title}>Notificações</Text>
      <FlatList
        data={notificacoes}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <View style={styles.notificationItem}>
            <Text style={styles.notificationText}>{item.titulo}</Text>
          </View>
        )}
      />
    </View>
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>⮕</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    backgroundColor: '#fff',
    color: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 20,
  },
  notificationItem: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  notificationText: {
    color: primaryColor,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#464193',
    color: '#ffffff',
    borderRadius: 50,
    fontWeight: '900',
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    top: 20,
    left: 240,
    transform: [{ rotate: '180deg' }],
  },
});
