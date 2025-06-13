import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Linking,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function DicasDeModa({ navigation }) {
  const [dicas, setDicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  // Função para extrair URLs de um texto
  const extractAndOpenURL = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = text.match(urlRegex);
    if (matches && matches.length > 0) {
      Linking.openURL(matches[0]).catch(err => Alert.alert('Erro', 'Não foi possível abrir o link.'));
      return true;
    }
    return false;
  };

  // Função para buscar o ID e token do usuário logado
  const fetchUserData = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('@currentUserEmail');
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);

      if (email && token) {
        const response = await api.get(`/api/usuario/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        // CORREÇÃO AQUI: Acessa user.id conforme o log da API
        const userId = response.data?.user?.id;
        setCurrentUserId(userId);
      } else {
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário para dicas:', error.response?.data || error.message);
      setCurrentUserId(null);
    }
  }, []);

  const fetchDicas = useCallback(async () => {
    setLoading(true);
    let dataToProcess = [];

    try {
      const response = await api.get('/api/Moda/dicas');

      if (response.data && Array.isArray(response.data)) {
        dataToProcess = response.data;
      } else {
        Alert.alert('Aviso', 'Estrutura de dados da API inesperada ou vazia. Carregando dicas padrão.');
        dataToProcess = [
          {
            id: 'dica-xyz1',
            titulo: 'DICA 1 - Essencial: Crie um Guarda-Roupas Cápsula',
            conteudo: 'Tenha peças-chave versáteis que combinem entre si, reduzindo o excesso e facilitando a criação de looks.',
            isverify: true,
            idUsuario: 'user123',
            verifyBy: 'admin',
            dataCriacao: '2025-05-10T10:00:00.000Z',
            ultimaAlteracao: '2025-05-10T10:00:00.000Z',
            tema: 'Moda Sustentável',
            subtemas: [{
              dica_id: 'dica-xyz1',
              subtema_id: 'guarda-roupa-capsula',
              assunto: 'Para mais informações: acesse o blog "Como montar um guarda-roupa cápsula para uma vida mais minimalista" em https://www.exemplo.com.br/guarda-roupa-capsula'
            }]
          },
          {
            id: 'dica-abc2',
            titulo: 'DICA 2 - Reutilize e Customiza: Transforme Suas Roupas Antigas',
            conteudo: 'Não descarte roupas antigas! Use bordados, patches ou tingimento para dar uma nova vida às suas peças.',
            isverify: true,
            idUsuario: 'user456',
            verifyBy: null,
            dataCriacao: '2025-05-12T11:30:00.000Z',
            ultimaAlteracao: '2025-05-12T11:30:00.000Z',
            tema: 'Upcycling',
            subtemas: []
          },
          {
            id: 'dica-def3',
            titulo: 'DICA 3 - Priorize Tecidos Sustentáveis e Naturais',
            conteudo: 'Opte por roupas feitas de algodão orgânico, linho, cânhamo ou tencel, que causam menos impacto ambiental.',
            isverify: true,
            idUsuario: 'user123',
            verifyBy: 'monitor',
            dataCriacao: '2025-05-15T14:45:00.000Z',
            ultimaAlteracao: '2025-05-15T14:45:00.000Z',
            tema: 'Materiais',
            subtemas: [{
              dica_id: 'dica-def3',
              subtema_id: 'tecidos-ecologicos',
              assunto: 'Dica de especialista: Estes materiais são mais respiráveis e duradouros.'
            }]
          },
        ];
      }

      console.log('Dicas Carregadas!');
      const sortedDicas = [...dataToProcess].sort((a, b) => {
        const numA = parseInt(a.titulo.match(/(\d+)/)?.[1] || 0);
        const numB = parseInt(b.titulo.match(/(\d+)/)?.[1] || 0);
        return numA - numB;
      });

      setDicas(sortedDicas);

    } catch (error) {
      console.error('Erro ao buscar dicas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as dicas da API. Carregando dicas padrão.');
      setDicas([
        { id: 'dica-xyz1', titulo: 'DICA 1 - Teste', conteudo: 'Conteúdo...', isverify: true, idUsuario: 'user123', dataCriacao: '...', subtemas: [] },
        { id: 'dica-abc2', titulo: 'DICA 2 - Teste', conteudo: 'Conteúdo...', isverify: true, idUsuario: 'anotherUser', dataCriacao: '...', subtemas: [] },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchDicas();
    const unsubscribe = navigation.addListener('focus', () => {
        fetchUserData();
        fetchDicas();
    });
    return unsubscribe;
  }, [fetchUserData, fetchDicas, navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDicas();
  }, [fetchDicas]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteDica = async (dicaId, dicaUserId) => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para deletar dicas.');
      navigation.navigate('Login');
      return;
    }
    if (currentUserId !== dicaUserId) {
      Alert.alert('Ação Não Permitida', 'Você só pode deletar dicas que você mesmo criou.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta dica?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.delete(`/api/dicas/${dicaId}`, {
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                },
              });
              if (response.status === 200) {
                Alert.alert('Sucesso', 'Dica excluída com sucesso!');
                setDicas(prevDicas => prevDicas.filter(dica => dica.id !== dicaId));
              } else {
                Alert.alert('Erro', response.data?.message || 'Erro ao excluir dica.');
              }
            } catch (error) {
              console.error('Erro ao excluir dica:', error.response?.data || error.message);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir a dica. Tente novamente.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
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
              const hasSubtemaAssunto = item.subtemas && item.subtemas.length > 0 && item.subtemas[0].assunto;
              const subtemaAssunto = hasSubtemaAssunto ? item.subtemas[0].assunto : null;
              const isOwner = currentUserId === item.idUsuario;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.title}>{item.titulo}</Text>
                    {isOwner && (
                      <TouchableOpacity
                        onPress={() => handleDeleteDica(item.id, item.idUsuario)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={20} color="red" />
                      </TouchableOpacity>
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#464193"
                    />
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <Text style={styles.description}>{item.conteudo}</Text>

                      {hasSubtemaAssunto && (
                        <Text style={styles.info}>
                          <Text style={styles.label}>Informações Adicionais: </Text>
                          {subtemaAssunto.includes('http') ? (
                            <Text style={styles.linkText} onPress={() => extractAndOpenURL(subtemaAssunto)}>
                              {subtemaAssunto}
                            </Text>
                          ) : (
                            subtemaAssunto
                          )}
                        </Text>
                      )}

                      {item.isCreatedBySpecialist && (
                        <Text style={styles.specialistBadge}>Dica de especialista</Text>
                      )}
                      {!item.isCreatedBySpecialist && item.isverify && !item.verifyBy && (
                        <Text style={styles.verifiedBadge}>Verificado</Text>
                      )}
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

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateDicas')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
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
    paddingBottom: 80,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
  deleteButton: {
    marginLeft: 'auto',
    padding: 5,
  },
  expandedContent: {
    marginTop: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 12,
    textAlign: 'justify',
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
  linkText: {
    color: '#0000EE',
    textDecorationLine: 'underline',
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
  verifiedBadge: {
    backgroundColor: '#28a745',
    color: '#fff',
    padding: 4,
    borderRadius: 4,
    fontSize: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  createButton: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#464193',
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
});
