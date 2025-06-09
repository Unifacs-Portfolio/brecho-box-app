import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/services/api';

export default function DicasDeModa({ navigation }) {
  const [dicas, setDicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchDicas = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/Moda/dicas');
      
      // Verifica se a resposta tem a estrutura esperada
      if (response.data && Array.isArray(response.data)) {
        setDicas(response.data);
      } else {
        throw new Error('Estrutura de dados inesperada');
      }
    } catch (error) {
      console.error('Erro ao buscar dicas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as dicas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDicas();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDicas();
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Função para formatar a data
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

      <Text style={styles.header}>Dicas de Moda</Text>

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
          {dicas.length > 0 ? (
            dicas.map((item) => {
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
                      <Text style={styles.description}>{item.conteudo}</Text>
                      
                      <View style={styles.infoContainer}>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Autor: </Text>
                          {item.idUsuario || 'Anônimo'}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Criado em: </Text>
                          {formatDate(item.dataCriacao)}
                        </Text>
                        <Text style={styles.info}>
                          <Text style={styles.label}>Verificado: </Text>
                          {item.isVerify ? 'Sim' : 'Não'}
                        </Text>
                        {item.isCreatedBySpecialist && (
                          <Text style={styles.specialistBadge}>Dica de especialista</Text>
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <Text style={styles.emptyMessage}>Nenhuma dica encontrada</Text>
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
  specialistBadge: {
    backgroundColor: '#464193',
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
});
