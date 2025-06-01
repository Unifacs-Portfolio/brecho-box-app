import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * Displays fashion tips in a scrollable view. Initially shows a loading indicator
 * while fetching mock data, then renders a list of fashion tips.
 * @param {object} navigation - Navigation object for handling navigation actions.
 */

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);

  useEffect(() => {
    // Simula a consulta ao banco
    setTimeout(() => {
      setReceitas([
        {
          id: '1',
          titulo: 'Look Casual com Jeans e Camiseta Branca',
          descricao: 'Combine uma calça jeans de cintura alta com uma camiseta branca básica...',
          foto: 'https://via.placeholder.com/300x200.png?text=Look+Casual',
          dica: 'Ideal para passeios de fim de semana.',
          estacao: 'Primavera/Verão',
          materiais: 'Algodão, Jeans, Couro ecológico',
        },
        {
          id: '2',
          titulo: 'Estilo Office com Toque Fashion',
          descricao: 'Use uma calça alfaiataria com uma blusa de seda...',
          foto: 'https://via.placeholder.com/300x200.png?text=Estilo+Office',
          dica: 'Perfeito para reuniões e eventos formais.',
          estacao: 'Outono/Inverno',
          materiais: 'Seda, Lã, Couro',
        },
        {
          id: '3',
          titulo: 'Receita de look sustentável',
          descricao: 'Reaproveite peças vintage, como jaquetas jeans antigas...',
          foto: 'https://via.placeholder.com/300x200.png?text=Look+Sustentável',
          dica: 'Aposte em brechós e customizações.',
          estacao: 'Ano todo',
          materiais: 'Peças recicladas, Algodão orgânico',
        },
      ]);
      setLoading(false);
    }, 1500);
  }, []);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

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
          {receitas.map((item) => {
            const isExpanded = expandedIds.includes(item.id);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={() => toggleExpand(item.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.title}>{item.titulo}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#464193"
                  />
                </View>

                {isExpanded && (
                  <View style={styles.expandedContent}>
                    <Image
                      source={{ uri: item.foto }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                    <Text style={styles.description}>{item.descricao}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Dica: </Text>{item.dica}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Estação: </Text>{item.estacao}</Text>
                    <Text style={styles.info}><Text style={styles.label}>Materiais: </Text>{item.materiais}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#464193',
    marginRight: 10,
  },
  expandedContent: {
    marginTop: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 8,
  },
  info: {
    fontSize: 13,
    color: '#333',
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    color: '#464193',
  },
});
