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

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193'; 
const dangerColor = '#D9534F'; 

export default function DicasDeModa({ navigation }) {
  const [dicas, setDicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null); 
  const [isCurrentUserMonitor, setIsCurrentUserMonitor] = useState(false); 

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

  // Função para buscar o ID, email e token do usuário logado e o status de monitor
  const fetchUserData = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('@currentUserEmail');
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('@currentUserId'); 
      
      setUserToken(token);
      setUserEmail(email); 

      if (id && token) {
        const response = await api.get(`/api/usuario/${id}`, { 
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const fetchedUserId = response.data?.id || response.data?.user?.id; 
        const isMonitor = response.data?.is_monitor || response.data?.user?.is_monitor || false; // Assume false se não existir
        
        setCurrentUserId(fetchedUserId);
        setIsCurrentUserMonitor(isMonitor); 
      } else {
        setCurrentUserId(null);
        setIsCurrentUserMonitor(false); 
        console.log("Nenhum usuário logado ou token/ID ausente.");
      }

    } catch (error) {
      console.error('Erro ao buscar dados do usuário para dicas:', error.response?.data || error.message);
      setCurrentUserId(null);
      setIsCurrentUserMonitor(false); // Garante que o status seja false em caso de erro
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

  const handleDeleteDica = async (dicaId, dicaUsuarioId) => { 
    if (!userToken || !userEmail) {
      Alert.alert('Erro', 'Você precisa estar logado para deletar dicas.');
      navigation.navigate('Login');
      return;
    }

    // Lógica de exclusão: permite deletar se for o criador OU se for um monitor
    if (currentUserId !== dicaUsuarioId && !isCurrentUserMonitor) {
      Alert.alert('Ação Não Permitida', 'Você só pode deletar dicas que você mesmo criou ou se for um monitor.');
      console.log(`Tentativa de deletar: currentUserId = ${currentUserId}, dicaUsuarioId = ${dicaUsuarioId}, isCurrentUserMonitor = ${isCurrentUserMonitor}`);
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
                // Se a API exige o email do criador no corpo da requisição DELETE
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

  // Nova função para lidar com a edição de dicas
  const handleEditDica = (dicaId) => {
    navigation.navigate('EditDicas', { dicaId: dicaId }); // Navega para a tela de edição
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('EscolhaDicasReceitas')}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <StyledText style={styles.header}>Dicas de Moda</StyledText>

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
              
              // Verifica se o usuário logado é o criador da dica
              const isOwner = currentUserId && item.usuarioId && currentUserId === item.usuarioId;
              // Permite modificar se for o criador OU se for um monitor
              const canModify = isOwner || isCurrentUserMonitor;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => toggleExpand(item.id)} // Expande/recolhe o card
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <StyledText style={styles.title}>{item.titulo}</StyledText>
                    {/* Botões de Ação (Editar e Excluir) */}
                    {canModify && ( 
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          onPress={() => handleEditDica(item.id)}
                          style={styles.editButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#464193" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteDica(item.id, item.usuarioId)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                    )}
                    {/* Ícone de expansão */}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#464193"
                    />
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      <StyledText style={styles.description}>{item.conteudo}</StyledText>

                      {hasSubtemaAssunto && (
                        <StyledText style={styles.info}>
                          <StyledText style={styles.label}>Informações Adicionais: </StyledText>
                          {subtemaAssunto.includes('http') ? (
                            <StyledText style={styles.linkText} onPress={() => extractAndOpenURL(subtemaAssunto)}>
                              {subtemaAssunto}
                            </StyledText>
                          ) : (
                            subtemaAssunto
                          )}
                        </StyledText>
                      )}

                      {/* Exibição do badge "Verificado" */}
                      {item.isverify && ( 
                        <StyledText style={styles.verifiedBadge}>Verificado</StyledText>
                      )}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <StyledText style={styles.emptyMessage}>Nenhuma dica encontrada</StyledText>
          )}
        </ScrollView>
      )}

      {/* O botão de criar dicas só aparece para monitores */}
      {isCurrentUserMonitor && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateDicas')} 
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}
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
  actionButtonsContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto', 
  },
  editButton: {
    padding: 5,
    marginRight: 10, 
  },
  deleteButton: {
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
  disabledButton: { 
    opacity: 0.7,
  },
  deleteButtonText: { 
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
