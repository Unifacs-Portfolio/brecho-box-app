import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  Linking,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  // Função para extrair o ID do vídeo do YouTube e retornar a URL da thumbnail
  const getYouTubeThumbnail = (youtubeUrl) => {
    if (!youtubeUrl) return null;
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[1] ? match[1] : null;

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  };

  // Função para abrir o link do YouTube
  const openYouTubeLink = (url) => {
    Linking.openURL(url).catch(err => Alert.alert('Erro', 'Não foi possível abrir o link do YouTube.'));
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
        const userId = response.data?.user?.id;
        setCurrentUserId(userId);
      } else {
        setCurrentUserId(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário para receitas:', error.response?.data || error.message);
      setCurrentUserId(null);
    }
  }, []);

  const fetchReceitas = useCallback(async () => {
    setLoading(true);
    let fetchedData = [];

    try {
      const response = await api.get('/api/Moda/receitas');

      if (response.data && Array.isArray(response.data.receitas) && response.data.receitas.length > 0) {
        fetchedData = response.data.receitas;
      } else {
        Alert.alert('Aviso', 'Carregando receitas padrão por falta de dados na API.');
        fetchedData = [
          {
            id: 'rec-c1f9bd4b',
            titulo: '13 - Transforme Um Lenço em Uma Bolsa de Nó (Furoshiki)',
            conteudo: 'Passo a Passo:\n1 ) Abra o lenço sobre uma superfície plana.\n2 ) Amarre as pontas opostas em nós firmes. \n3 ) Faça o mesmo com as outras pontas para criar a base da bolsa.\n4 ) Adicione alças reutilizáveis , se desejar , para maior praticidade .',
            isverify: true,
            idUsuario: 'user123',
            verifyBy: null,
            dataCriacao: '2025-06-04T23:35:47.000Z',
            ultimaAlteracao: '2025-06-04T23:35:47.000Z',
            tema: 'Moda',
            subtemas: ['subtema-moda-sustentavel'],
            fotos: ['https://www.youtube.com/watch?v=d_xVzY_i8A8']
          },
          {
            id: 'rec-26efb810',
            titulo: '5 - Personalização de Jaqueta Jeans com Patches e Bordados',
            conteudo: 'Customize sua jaqueta jeans adicionando patches de tecido e bordados coloridos para criar um estilo único. Essa técnica permite transformar uma peça antiga em algo novo e expressivo, além de ser uma ótima forma de demonstrar sua criatividade e engajamento com a moda sustentável.',
            isverify: true,
            idUsuario: 'user456',
            verifyBy: null,
            dataCriacao: '2025-06-05T10:00:00.000Z',
            ultimaAlteracao: '2025-06-05T10:00:00.000Z',
            tema: 'Moda',
            subtemas: ['subtema-customizacao'],
            fotos: ['https://www.youtube.com/watch?v=F_fG1d1K_2c']
          },
          {
            id: 'rec-abcde123',
            titulo: '1 - Como Fazer Peças de Roupa com Materiais Reciclados',
            conteudo: 'Aprenda a criar roupas incríveis usando tecidos e materiais que seriam descartados. Desde camisetas antigas a retalhos de tecido, as possibilidades são infinitas. Este tutorial foca em técnicas de costura e upcycling para transformar o lixo em luxo, promovendo a sustentabilidade na moda.',
            isverify: true,
            idUsuario: 'user123',
            verifyBy: 'monitor_a',
            dataCriacao: '2025-06-03T15:20:00.000Z',
            ultimaAlteracao: '2025-06-03T15:20:00.000Z',
            tema: 'Sustentabilidade',
            subtemas: ['subtema-reciclagem', 'subtema-upcycling'],
            fotos: ['https://www.youtube.com/watch?v=dQw4w9WgXcQ']
          },
        ];
      }

      console.log('Receitas Carregadas!');
      const sortedReceitas = fetchedData.sort((a, b) => {
        const numA = parseInt(a.titulo.match(/^\d+/)?.[0] || 0);
        const numB = parseInt(b.titulo.match(/^\d+/)?.[0] || 0);
        return numA - numB;
      });

      setReceitas(sortedReceitas);

    } catch (error) {
      console.error('Erro ao buscar receitas:', error);
      Alert.alert('Erro', 'Não foi possível carregar as receitas');
      setReceitas([
        { id: 'rec-test1', titulo: '1 - Receita Teste', conteudo: 'Conteúdo...', fotos: [], idUsuario: 'user123', isverify: true },
        { id: 'rec-test2', titulo: '2 - Outra Receita', conteudo: 'Conteúdo...', fotos: [], idUsuario: 'anotherUser', isverify: true },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
    fetchReceitas();
    const unsubscribe = navigation.addListener('focus', () => {
        fetchUserData();
        fetchReceitas();
    });
    return unsubscribe;
  }, [fetchUserData, fetchReceitas, navigation]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReceitas();
  }, [fetchReceitas]);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleDeleteReceita = async (receitaId, receitaUserId) => {
    if (currentUserId !== receitaUserId) {
      Alert.alert('Ação Não Permitida', 'Você só pode deletar receitas que você mesmo criou.');
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta receita?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.delete(`/api/receitas/${receitaId}`);
              if (response.status === 200) {
                Alert.alert('Sucesso', 'Receita excluída com sucesso!');
                setReceitas(prevReceitas => prevReceitas.filter(receita => receita.id !== receitaId));
              } else {
                Alert.alert('Erro', response.data?.message || 'Erro ao excluir receita.');
              }
            } catch (error) {
              console.error('Erro ao excluir receita:', error.response?.data || error.message);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir a receita. Tente novamente.');
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
              const thumbnailUrl = item.fotos && item.fotos.length > 0 ? getYouTubeThumbnail(item.fotos[0]) : null;
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
                        onPress={() => handleDeleteReceita(item.id, item.idUsuario)}
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
                      {thumbnailUrl && (
                        <TouchableOpacity onPress={() => openYouTubeLink(item.fotos[0])}>
                          <Image
                            source={{ uri: thumbnailUrl }}
                            style={styles.image}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      )}
                      <Text style={styles.description}>{item.conteudo}</Text>

                      <View style={styles.infoContainer}>
                        {item.fotos && item.fotos.length > 0 && (item.fotos[0].includes('youtube.com') || item.fotos[0].includes('youtu.be')) && (
                          <Text style={styles.info}>
                            <Text style={styles.label}>Vídeo: </Text>
                            <Text style={styles.youtubeLink} onPress={() => openYouTubeLink(item.fotos[0])}>
                              {item.fotos[0].substring(0, 40)}...
                            </Text>
                          </Text>
                        )}
                        <Text style={styles.info}>
                          <Text style={styles.label}>Data: </Text>
                          {formatDate(item.dataCriacao)}
                        </Text>
                        {/* Se a propriedade 'verificada' existe no item e é verdadeira, exibe o badge */}
                        {item.isVerify && ( 
                            <Text style={styles.verifiedBadge}>Verificado</Text>
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

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateReceitas')}
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  image: {
    width: '100%',
    height: width * 0.55,
    borderRadius: 12,
    marginBottom: 10,
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
  youtubeLink: {
    color: '#0000EE',
    textDecorationLine: 'underline',
  },
  emptyMessage: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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
 
  verifiedBadge: {
    backgroundColor: '#28a745', 
    color: '#fff', 
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 5,
    fontSize: 12,
    fontWeight: 'bold',
    alignSelf: 'flex-start', 
    marginTop: 10, 
  },
});
