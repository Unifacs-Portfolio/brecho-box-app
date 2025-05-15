import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      {/* Botão de Voltar */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Ionicons name="arrow-back" size={24} color={primaryColor} />
        <Text style={styles.backButtonText}>Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Receitas de Moda</Text>

      {loading ? (
        <ActivityIndicator size="large" color={primaryColor} />
      ) : (
        <ScrollView>
          {receitas.map((receita) => (
            <View key={receita.id} style={styles.card}>
              <Text style={styles.title}>{receita.titulo}</Text>
              <Text style={styles.description}>{receita.descricao}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: 20,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#f2f2f2',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: primaryColor,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#444',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButtonText: {
    color: primaryColor,
    fontSize: 16,
    marginLeft: 8,
  },
});
