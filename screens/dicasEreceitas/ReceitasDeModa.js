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
const primaryColor = '#473da1'; // Cor principal
const dangerColor = '#D9534F'; // Cor para botão de exclusão

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null); 
  const [userToken, setUserToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null); 

  // Regex para encontrar URLs do YouTube no texto do conteúdo
  const youtubeUrlRegex = /(https?:\/\/(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([a-zA-Z0-9_-]{11}))/i;

  // Função para extrair o ID do vídeo do YouTube e retornar a URL da thumbnail
  const getYouTubeThumbnail = (content) => {
    if (!content || typeof content !== 'string') return null;
    const match = content.match(youtubeUrlRegex);
    const videoId = match && match[2] ? match[2] : null;

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  };

  // Função para abrir o link do YouTube extraído do conteúdo
  const openYouTubeLink = (content) => {
    if (!content || typeof content !== 'string') {
      Alert.alert('Erro', 'Conteúdo inválido para abrir link do YouTube.');
      return;
    }
    const match = content.match(youtubeUrlRegex);
    if (match && match[1]) {
      Linking.openURL(match[1]).catch(err => Alert.alert('Erro', 'Não foi possível abrir o link do YouTube.'));
    } else {
      Alert.alert('Erro', 'Nenhum link do YouTube válido encontrado no conteúdo.');
    }
  };

  // Função para buscar o ID, email e token do usuário logado
  const fetchUserData = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('@currentUserEmail');
      const token = await AsyncStorage.getItem('userToken');
      setUserToken(token);
      setUserEmail(email);

      if (email && token) {
        const response = await api.get(`/api/usuario/${email}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const userId = response.data?.id || response.data?.user?.id; 
        setCurrentUserId(userId);
        console.log("Usuário logado ID (fetchUserData):", userId);
      } else {
        setCurrentUserId(null);
        console.log("Nenhum usuário logado ou token ausente.");
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
            conteudo: 'Passo a Passo:\n1 ) Abra o lenço sobre uma superfície plana.\n2 ) Amarre as pontas opostas em nós firmes.\n3 ) Faça o mesmo com as outras pontas para criar a base da bolsa.\n4 ) Adicione alças reutilizáveis , se desejar , para maior praticidade.\n\nYouTube Link: https://www.youtube.com/watch?v=UHOH79SU41k',
            isverify: true,
            usuarioId: '0370e782-4669-4ac4-8f59-c5bba0cd4225', // ID de exemplo
            verifyBy: null,
            dataCriacao: '2025-06-04T23:35:47.000Z',
            ultimaAlteracao: '2025-06-04T23:35:47.000Z',
            tema: 'Moda',
            subtemas: ['subtema-moda-sustentavel'],
            fotos: [] // Agora 'fotos' pode vir vazio ou não existir
          },
          {
            id: 'rec-26efb810',
            titulo: '5 - Personalização de Jaqueta Jeans com Patches e Bordados',
            conteudo: 'Customize sua jaqueta jeans adicionando patches de tecido e bordados coloridos para criar um estilo único. Essa técnica permite transformar uma peça antiga em algo novo e expressivo, além de ser uma ótima forma de demonstrar sua criatividade e engajamento com a moda sustentável.\n\nAssista: https://youtu.be/F_fG1d1K_2c',
            isverify: true,
            usuarioId: 'outro_id_de_usuario', // Outro ID de exemplo
            verifyBy: null,
            dataCriacao: '2025-06-05T10:00:00.000Z',
            ultimaAlteracao: '2025-06-05T10:00:00.000Z',
            tema: 'Moda',
            subtemas: ['subtema-customizacao'],
            fotos: []
          },
          {
            id: 'rec-abcde123',
            titulo: '1 - Como Fazer Peças de Roupa com Materiais Reciclados',
            conteudo: 'Aprenda a criar roupas incríveis usando tecidos e materiais que seriam descartados. Desde camisetas antigas a retalhos de tecido, as possibilidades são infinitas. Este tutorial foca em técnicas de costura e upcycling para transformar o lixo em luxo, promovendo a sustentabilidade na moda.\n\nMais detalhes em: https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isverify: true,
            usuarioId: '0370e782-4669-4ac4-8f59-c5bba0cd4225', // ID de exemplo
            verifyBy: 'monitor_a',
            dataCriacao: '2025-06-03T15:20:00.000Z',
            ultimaAlteracao: '2025-06-03T15:20:00.000Z',
            tema: 'Sustentabilidade',
            subtemas: ['subtema-reciclagem', 'subtema-upcycling'],
            fotos: []
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
        { id: 'rec-test1', titulo: '1 - Receita Teste', conteudo: 'Conteúdo...', fotos: [], usuarioId: '0370e782-4669-4ac4-8f59-c5bba0cd4225', isverify: true },
        { id: 'rec-test2', titulo: '2 - Outra Receita', conteudo: 'Conteúdo...', fotos: [], usuarioId: 'outro_id_de_usuario', isverify: true },
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

  const handleDeleteReceita = async (receitaId, receitaUsuarioId) => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para deletar receitas.');
      navigation.navigate('Login');
      return;
    }

    if (!receitaUsuarioId || currentUserId !== receitaUsuarioId) {
      Alert.alert('Ação Não Permitida', 'Você só pode deletar receitas que você mesmo criou.');
      console.log(`Tentativa de deletar receita: currentUserId = ${currentUserId}, receitaUsuarioId = ${receitaUsuarioId}`);
      return;
    }

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta receita? Esta ação é irreversível.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await api.delete(`/api/receitas/${receitaId}`, {
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                },
              });
              if (response.status === 200 || response.status === 204) {
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
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('EscolhaDicasReceitas')}>
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
              const isOwner = currentUserId && item.usuarioId && currentUserId === item.usuarioId;
              const thumbnailUrl = getYouTubeThumbnail(item.conteudo); 
              
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
                      {thumbnailUrl ? ( // Renderiza a imagem se houver thumbnail
                        <TouchableOpacity onPress={() => openYouTubeLink(item.conteudo)}>
                          <Image
                            source={{ uri: thumbnailUrl }}
                            style={styles.image}
                            resizeMode="cover"
                          />
                        </TouchableOpacity>
                      ) : ( // Placeholder se não houver thumbnail
                        <View style={styles.imagePlaceholder}>
                          <Ionicons name="videocam-off-outline" size={50} color="#ccc" />
                          <Text style={styles.imagePlaceholderText}>Vídeo Não Disponível</Text>
                        </View>
                      )}
                      
                      {/* Exibe o conteúdo completo */}
                      <Text style={styles.description}>{item.conteudo}</Text>

                      <View style={styles.infoContainer}>
                        {/* Remove a exibição do link do YouTube separado, pois já está no conteúdo */}
                        <Text style={styles.info}>
                          <Text style={styles.label}>Data: </Text>
                          {formatDate(item.dataCriacao)}
                        </Text>
                        {item.isVerify && ( 
                            <Text style={styles.verifiedBadge}>Verificado</Text>
                        )}
                      </View>
                       {isOwner && (
                        <TouchableOpacity
                          style={[styles.deleteButton, loading && styles.disabledButton]}
                          onPress={() => handleDeleteReceita(item.id, item.usuarioId)}
                          disabled={loading}
                        >
                          {loading ? (
                            <ActivityIndicator color="#fff" />
                          ) : (
                            <Text style={styles.deleteButtonText}>Excluir Receita</Text>
                          )}
                        </TouchableOpacity>
                      )}
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
    backgroundColor: dangerColor,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    alignSelf: 'flex-end',
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
  imagePlaceholder: { // Novo estilo para placeholder da imagem
    width: '100%',
    height: width * 0.55,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#888',
    marginTop: 5,
    fontSize: 14,
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
  disabledButton: {
    opacity: 0.7,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
