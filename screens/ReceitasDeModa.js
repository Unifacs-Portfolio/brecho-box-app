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
import api from '../src/services/api';

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReceitas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/receitas/tema/moda');
      
      // Verifica se a resposta tem a estrutura esperada
      if (response.data && Array.isArray(response.data.dadosCru)) {
        setReceitas(response.data.dadosCru);
      } else {
        throw new Error('Estrutura de dados inesperada');
      }
    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as receitas');
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

  // Função para formatar a data
  const formatDate = (dateString) => {
    if (!dateString) return 'Data não disponível';
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
                      {item.image_source && (
                        <Image
                          source={{ uri: item.image_source }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      )}
                      <Text style={styles.description}>{item.conteudo}</Text>
                      
                      <View style={styles.infoContainer}>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Autor: </Text>
                          {item.usuario?.nome || 'Anônimo'}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Criado em: </Text>
                          {formatDate(item.data_criacao)}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Verificado: </Text>
                          {item.is_verify ? 'Sim' : 'Não'}
                        </Text>
                        {item.subtemas && item.subtemas.length > 0 && (
                          <Text style={styles.info}>
                            <Text style={styles.label}>Subtemas: </Text>
                            {item.subtemas.join(', ')}
                          </Text>
                        )}
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