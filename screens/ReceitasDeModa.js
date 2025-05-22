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

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Displays fashion tips in a scrollable view. Initially shows a loading indicator
 * while fetching mock data, then renders a list of fashion tips.
 * @param {object} navigation - Navigation object for handling navigation actions.
 */

/*******  0474fc98-cec8-435c-bb68-ca8d4a0c2b20  *******/export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulando requisição com mock de dados
    setTimeout(() => {
      setReceitas([
        {
          id: '1',
          titulo: 'Look Casual com Jeans e Camiseta Branca',
          descricao:
            'Combine uma calça jeans de cintura alta com uma camiseta branca básica, acessórios dourados e um tênis branco para um visual casual-chique.',
        },
        {
          id: '2',
          titulo: 'Estilo Office com Toque Fashion',
          descricao:
            'Use uma calça alfaiataria com uma blusa de seda e sapato de salto nude. Complete com uma bolsa estruturada e um blazer moderno.',
        },
        {
          id: '3',
          titulo: 'Receita de look sustentável',
          descricao:
            'Reaproveite peças vintage, como jaquetas jeans antigas, combinando com vestidos florais leves e botas para um visual boho ecológico.',
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  return (
    <View style={styles.container}>
      {/* Botão de voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Receitas de Moda</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {receitas.map((item) => (
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
