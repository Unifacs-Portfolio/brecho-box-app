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
const primaryColor = '#473da1'; 
const dangerColor = '#D9534F'; 

export default function DicasDeModa({ navigation }) {
  const [dicas, setDicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null); 

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

  // Função para buscar o ID, email e token do usuário logado
  const fetchUserData = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('@currentUserEmail');
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setUserEmail(email); // Armazena o email também

      if (email && token) {
        const response = await api.get(`/api/usuario/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });


        const userId = response.data?.id || response.data?.user?.id; 
        setCurrentUserId(userId);
        console.log("Usuário logado ID (fetchUserData):", userId);
        console.log("Usuário logado Email (fetchUserData):", email);
      } else {
        setCurrentUserId(null);
        console.log("Nenhum usuário logado ou token ausente.");
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

      if (response.data.dicas && Array.isArray(response.data.dicas)) {
        dataToProcess = response.data.dicas;
      } else {
        Alert.alert('Aviso', 'Estrutura de dados da API inesperada ou vazia. Carregando dicas padrão.');
        // Dados padrão de exemplo com usuarioId e email para teste de autoria
        dataToProcess = [
          {
            id: 'dica-xyz1',
            titulo: 'DICA 1 - Essencial: Crie um Guarda-Roupas Cápsula',
            conteudo: 'Tenha peças-chave versáteis que combinem entre si, reduzindo o excesso e facilitando a criação de looks.',
            isverify: true,
            usuarioId: '0370e782-4669-4ac4-8f59-c5bba0cd4225', // ID de exemplo
            email: 'usuario1@example.com', // Email associado a este ID
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
            usuarioId: 'outro_id_de_usuario', // Outro ID de exemplo
            email: 'usuario2@example.com', // Outro email
            verifyBy: null,
            dataCriacao: '2025-05-12T11:30:00.000Z',
            ultimaAlteracao: '2025-05-12T11:30:00.000Z',
            tema: 'Upcycling',
            subtemas: []
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
        // Exemplo de fallback com usuarioId e email
        { id: 'dica-xyz1', titulo: 'DICA 1 - Teste', conteudo: 'Conteúdo...', isverify: true, usuarioId: '0370e782-4669-4ac4-8f59-c5bba0cd4225', email: 'usuario1@example.com', dataCriacao: '...', subtemas: [] },
        { id: 'dica-abc2', titulo: 'DICA 2 - Teste', conteudo: 'Conteúdo...', isverify: true, usuarioId: 'outro_id_de_usuario', email: 'usuario2@example.com', dataCriacao: '...', subtemas: [] },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchDicas();
    // Listener para recarregar as dicas quando a tela estiver em foco
    const unsubscribe = navigation.addListener('focus', () => {
        fetchUserData(); // Recarrega os dados do usuário para garantir email/ID atualizados
        fetchDicas();
    });
    return unsubscribe;
  }, [fetchUserData, fetchDicas, navigation]); // Adicionado fetchUserData às dependências

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDicas();
  }, [fetchDicas]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleDeleteDica = async (dicaId, dicaUsuarioId) => { // Agora recebe o usuarioId da dica
    if (!userToken || !userEmail) {
      Alert.alert('Erro', 'Você precisa estar logado para deletar dicas.');
      navigation.navigate('Login');
      return;
    }

    if (!dicaUsuarioId || currentUserId !== dicaUsuarioId) {
      Alert.alert('Ação Não Permitida', 'Você só pode deletar dicas que você mesmo criou.');
      console.log(`Tentativa de deletar: currentUserId = ${currentUserId}, dicaUsuarioId = ${dicaUsuarioId}`);
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta dica? Esta ação é irreversível.',
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
                data: {
                  email: userEmail, 
                }
              });
              if (response.status === 200 || response.status === 204) {
                Alert.alert('Sucesso', 'Dica excluída com sucesso!');
                // Remove a dica do estado local para que a lista seja atualizada
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('EscolhaDicasReceitas')}>
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
              const isOwner = currentUserId && item.usuarioId && currentUserId === item.usuarioId;

              console.log(`Dica ID: ${item.id}, Título: ${item.titulo}`);
              console.log(`  usuarioId da Dica: ${item.usuarioId}, currentUserId (logado): ${currentUserId}`);
              console.log(`  É o criador (isOwner)? ${isOwner}`);


              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => toggleExpand(item.id)} 
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <Text style={styles.title}>{item.titulo}</Text>
                    {/* Ícone de expansão */}
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

                      {/* Botão de Excluir - Visível apenas se o usuário for o criador */}
                      {isOwner && (
                        <TouchableOpacity
                          style={[styles.deleteButton, loading && styles.disabledButton]}
                          onPress={() => handleDeleteDica(item.id, item.usuarioId)} // Passa ID da dica e usuarioId do criador
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.deleteButtonText}>Excluir Dica</Text>
                          )}
                        </TouchableOpacity>
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
    backgroundColor: primaryColor, 
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
  deleteButton: { 
    backgroundColor: dangerColor,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    alignSelf: 'flex-end', 
  },
  disabledButton: { 
    opacity: 0.7,
  },
  deleteButtonText: { 
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
