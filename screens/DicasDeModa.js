import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DicasDeModa({ navigation }) {
  const [dicas, setDicas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Dados simulados (mock) - sem delay
    const mockDicas = [
      {
        id: '1',
        titulo: 'Use camadas para adicionar estilo',
        descricao:
          'Adicionar jaquetas, lenços ou coletes pode transformar completamente um look básico em algo mais interessante.',
      },
      {
        id: '2',
        titulo: 'Aposte em cores neutras',
        descricao:
          'Cores como branco, preto, bege e cinza são versáteis, atemporais e combinam com praticamente tudo.',
      },
      {
        id: '3',
        titulo: 'Sapatos certos fazem diferença',
        descricao:
          'Escolher o calçado ideal pode mudar totalmente o estilo do seu look. Invista em modelos coringas como tênis branco, bota preta e sandália nude.',
      },
    ];

    setDicas(mockDicas);
    setLoading(false);
  }, []);

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Dicas de Moda</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {dicas.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.title}>{item.titulo}</Text>
              <Text style={styles.description}>{item.descricao}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#473da1',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    backgroundColor: '#ffffff44',
    padding: 8,
    borderRadius: 10,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginBottom: 30,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#464193',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
});
