import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/Moda/receitas');

      if (response.data && Array.isArray(response.data.dadosCru) && response.data.dadosCru.length > 0) {
        setReceitas(response.data.dadosCru);
      } else {
        throw new Error('Nenhum dado retornado ou estrutura inválida');
      }
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      Alert.alert('Aviso', 'Carregando receitas padrão por falta de dados na API.');

      // Mock de dados
      setReceitas([
        {
          id: '1',
          titulo: 'Look Casual com Jeans e Camiseta Branca',
          descricao: 'Combine uma calça jeans de cintura alta com uma camiseta branca básica...',
          foto: 'https://blog.cea.com.br/wp-content/uploads/2024/03/1-3_calca-jeans-super-wide-leg-azul.jpg',
          dica: 'Ideal para passeios de fim de semana.',
          estacao: 'Primavera/Verão',
          materiais: 'Algodão, Jeans, Couro ecológico',
        },
        {
          id: '2',
          titulo: 'Estilo Office com Toque Fashion',
          descricao: 'Use uma calça alfaiataria com uma blusa de seda...',
          foto: 'https://endutex.com.br/wp-content/uploads/2023/07/endutex_noticia_site_junho_4.jpg',
          dica: 'Perfeito para reuniões e eventos formais.',
          estacao: 'Outono/Inverno',
          materiais: 'Seda, Lã, Couro',
        },
        {
          id: '3',
          titulo: 'Receita de look sustentável',
          descricao: 'Reaproveite peças vintage, como jaquetas jeans antigas...',
          foto: 'https://admin.cnnbrasil.com.br/wp-content/uploads/sites/12/2023/03/qual-o-conceito-de-moda-sustentavel.jpg',
          dica: 'Aposte em brechós e customizações.',
          estacao: 'Ano todo',
          materiais: 'Peças recicladas, Algodão orgânico',
        },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReceitas();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReceitas();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.header}>Receitas de Moda</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#fff" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#fff']}
              tintColor="#fff"
            />
          }
        >
          {receitas.length > 0 ? (
            receitas.map((item) => {
              const isExpanded = expandedId === item.id;
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
                      {item.foto && (
                        <Image
                          source={{ uri: item.foto }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      )}
                      <Text style={styles.description}>{item.descricao}</Text>

                      <View style={styles.infoContainer}>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Dica: </Text>
                          {item.dica || 'Sem dica'}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Estação: </Text>
                          {item.estacao || 'Não especificada'}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Materiais: </Text>
                          {item.materiais || 'Desconhecidos'}
                        </Text>
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyMessage}>Nenhuma receita encontrada</Text>
          )}
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
    flexShrink: 1,
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
    marginBottom: 12,
  },
  infoContainer: {
    marginTop: 8,
  },
  info: {
    fontSize: 13,
    color: '#333',
    marginBottom: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#464193',
  },
  emptyMessage: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
