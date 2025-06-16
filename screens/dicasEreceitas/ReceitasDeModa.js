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

import StyledText from '../../src/components/StyledText';

const { width, height } = Dimensions.get('window');

export default function ReceitasDeModa({ navigation }) {
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isCurrentUserMonitor, setIsCurrentUserMonitor] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState({});

  // Função para navegar entre as imagens e vídeo
  const handleImagePress = (receitaId, totalImages, hasVideo, currentMedia) => {
    if (currentMedia.type === 'video') {
      openVideoLink(currentMedia.videoUrl);
      return;
    }

    setCurrentImageIndex(prev => ({
      ...prev,
      [receitaId]: (prev[receitaId] || 0) + 1 >= totalImages + (hasVideo ? 1 : 0)
        ? 0
        : (prev[receitaId] || 0) + 1
    }));
  };

  // Função para extrair URLs de vídeo de qualquer plataforma
  const extractVideoUrlAndGetThumbnail = (text) => {
    if (!text) return { videoUrl: null, thumbnailUrl: null, platform: null };

    // Regex para múltiplas plataformas
    const videoRegex = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|shorts)\/|\S*?[?&]v=|youtu\.be\/|tiktok\.com\/@[^\/]+\/video\/|tiktok\.com\/v\/|vm\.tiktok\.com\/|t\.me\/[^\/]+\/[0-9]+)([a-zA-Z0-9_-]+)(?:[^\s]*)?)/;
    const match = text.replace(/\s+/g, '').match(videoRegex);


    if (match && match[1]) {
      const videoId = match[1];
      let thumbnailUrl = null;
      let platform = 'other';

      // Determina a plataforma e obtém a thumbnail apropriada
      if (text.includes('youtube.com') || text.includes('youtu.be')) {
        platform = 'youtube';
        thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      } else if (text.includes('tiktok.com') || text.includes('vm.tiktok.com')) {
        platform = 'tiktok';
        thumbnailUrl = 'https://play-lh.googleusercontent.com/Ui_-OW6UJI147ySDX9guWWDiCPSq1vtxoC-xG17BU2T0vz4Q0OZi3eJ9w0x5R4n7w=w240-h480-rw';
      } else if (text.includes('t.me')) {
        platform = 'telegram';
        thumbnailUrl = 'https://telegram.org/img/t_logo.png';
      }

      return {
        videoUrl: match[0],
        thumbnailUrl,
        platform
      };
    }
    return { videoUrl: null, thumbnailUrl: null, platform: null };
  };

  // Função para abrir o link do vídeo
  const openVideoLink = (url) => {
    if (url) {
      Linking.openURL(url).catch(err => Alert.alert('Erro', 'Não foi possível abrir o link do vídeo.'));
    }
  };

  // Função para verificar e corrigir o formato das fotos
  const getValidPhotos = (photos) => {
    const validPhotos = [];
    if (!photos || !Array.isArray(photos)) return validPhotos;

    photos.forEach(photo => {
      if (typeof photo === 'string' && photo.startsWith('http')) {
        validPhotos.push({ uri: photo, type: 'image' });
      } else if (typeof photo === 'string' && photo.startsWith('[')) {
        try {
          const parsedPhotos = JSON.parse(photo);
          if (Array.isArray(parsedPhotos)) {
            parsedPhotos.forEach(p => {
              if (typeof p === 'string' && p.startsWith('http')) {
                validPhotos.push({ uri: p, type: 'image' });
              }
            });
          }
        } catch (e) {
          console.error('Error parsing photos array:', e);
        }
      }
    });

    return validPhotos;
  };

  // Função para buscar o ID e token do usuário logado E o status de monitor
  const fetchUserData = useCallback(async () => {
    try {
      const email = await AsyncStorage.getItem('@currentUserEmail');
      const token = await AsyncStorage.getItem('userToken');
      const id = await AsyncStorage.getItem('@currentUserId');
      setUserToken(token);
      setUserEmail(email);
      setCurrentUserId(id);

      if (email && token && id) {
        const response = await api.get(`/api/usuario/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const userId = response.data?.user?.id;
        const isMonitor = response.data?.user?.is_monitor || false;

        setCurrentUserId(userId);
        setIsCurrentUserMonitor(isMonitor);
      } else {
        setCurrentUserId(null);
        setIsCurrentUserMonitor(false);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário para receitas:', error.response?.data || error.message);
      setCurrentUserId(null);
      setIsCurrentUserMonitor(false);
    }
  }, []);

  // Função para buscar receitas - adiciona reset de índices
  const fetchReceitas = useCallback(async () => {
    setLoading(true);
    setCurrentImageIndex({}); // Reseta todos os índices ao atualizar a lista
    try {
      const response = await api.get('/api/Moda/receitas');

      let fetchedData = [];
      if (response.data && Array.isArray(response.data.receitas) && response.data.receitas.length > 0) {
        fetchedData = response.data.receitas;
      } else {
        Alert.alert('Aviso', 'Carregando receitas padrão por falta de dados na API.');
        fetchedData = [
          {
            id: 'rec-c1f9bd4b',
            titulo: '13 - Transforme Um Lenço em Uma Bolsa de Nó (Furoshiki)',
            conteudo: 'Passo a Passo:\n1 ) Abra o lenço sobre uma superfície plana.\n2 ) Amarre as pontas opostas em nós firmes. \n3 ) Faça o mesmo com as outras pontas para criar a base da bolsa.\n4 ) Adicione alças reutilizáveis , se desejar , para maior praticidade .\nhttps://www.youtube.com/watch?v=d_xVzY_i8A8',
            isverify: true,
            idUsuario: 'user123',
            verifyBy: null,
            dataCriacao: '2025-06-04T23:35:47.000Z',
            ultimaAlteracao: '2025-06-04T23:35:47.000Z',
            tema: 'Moda',
            subtemas: ['subtema-moda-sustentavel'],
            fotos: ['https://placehold.co/600x400/FF00FF/FFFFFF?text=Imagem+Receita+1']
          },
          {
            id: 'rec-26efb810',
            titulo: '5 - Personalização de Jaqueta Jeans com Patches e Bordados',
            conteudo: 'Customize sua jaqueta jeans adicionando patches de tecido e bordados coloridos para criar um estilo único. Essa técnica permite transformar uma peça antiga em algo novo e expressivo, além de ser uma ótima forma de demonstrar sua criatividade e engajamento com a moda sustentável.\nhttps://www.youtube.com/watch?v=F_fG1d1K_2c',
            isverify: true,
            idUsuario: 'user456',
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
            conteudo: 'Aprenda a criar roupas incríveis usando tecidos e materiais que seriam descartados. Desde camisetas antigas a retalhos de tecido, as possibilidades são infinitas. Este tutorial foca em técnicas de costura e upcycling para transformar o lixo em luxo, promovendo a sustentabilidade na moda.\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ',
            isverify: true,
            idUsuario: 'user123',
            verifyBy: 'monitor_a',
            dataCriacao: '2025-06-03T15:20:00.000Z',
            ultimaAlteracao: '2025-06-03T15:20:00.000Z',
            tema: 'Sustentabilidade',
            subtemas: ['subtema-reciclagem', 'subtema-upcycling'],
            fotos: ['https://placehold.co/600x400/00FFFF/000000?text=Imagem+Receita+3']
          },
        ];
      }

      console.log('Receitas Carregadas!');
      const sortedReceitas = fetchedData.sort((a, b) => {
        const numA = parseInt(a.titulo.match(/^\D*(\d+)/)?.[1] || 0);
        const numB = parseInt(b.titulo.match(/^\D*(\d+)/)?.[1] || 0);

        const isNumAValid = !isNaN(numA) && numA !== undefined;
        const isNumBValid = !isNaN(numB) && numB !== undefined;

        if (isNumAValid && isNumBValid) {
          return numA - numB;
        } else if (isNumAValid) {
          return -1;
        } else if (isNumBValid) {
          return 1;
        } else {
          return a.titulo.localeCompare(b.titulo);
        }
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
    console.log(`Antes - expandedId: ${expandedId}, nova id: ${id}, currentIndex:`, currentImageIndex);
    
    setCurrentImageIndex(prev => {
      const newState = {
        ...prev,
        [id]: 0
      };
      if (expandedId !== id && expandedId !== null) {
        newState[expandedId] = 0;
      }
      console.log('Durante - novo estado:', newState);
      return newState;
    });
    
    setExpandedId(prev => prev === id ? null : id);
    
    console.log(`Depois - expandedId será: ${expandedId === id ? null : id}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const handleDeleteReceita = async (receitaId, receitaUserId) => {
    if (!userToken) {
      Alert.alert('Erro', 'Você precisa estar logado para deletar receitas.');
      navigation.navigate('Login');
      return;
    }
    if (currentUserId !== receitaUserId && !isCurrentUserMonitor) {
      Alert.alert('Ação Não Permitida', 'Você só pode deletar receitas que você mesmo criou ou se for um monitor.');
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
              const response = await api.delete(`/api/receitas/${receitaId}`, {
                headers: {
                  'Authorization': `Bearer ${userToken}`,
                },
              });
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

  const handleEditReceita = (receitaId) => {
    navigation.navigate('EditReceitas', { receitaId: receitaId });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('EscolhaDicasReceitas')}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>

      <StyledText style={styles.header}>Receitas de Moda</StyledText>

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

              const validPhotos = getValidPhotos(item.fotos);
              const { videoUrl, thumbnailUrl, platform } = extractVideoUrlAndGetThumbnail(item.conteudo);
              const hasVideo = !!thumbnailUrl;

              if (hasVideo) {
                validPhotos.push({
                  uri: thumbnailUrl,
                  type: 'video',
                  videoUrl,
                  platform
                });
              }

              const currentIndex = currentImageIndex[item.id] || 0; // Sempre começa em 0
              const currentMedia = validPhotos.length > 0 ? validPhotos[currentIndex % validPhotos.length] : null;
              const canCycleImages = validPhotos.length > 1;

              const isOwner = currentUserId === item.idUsuario;
              const canModify = isCurrentUserMonitor || isOwner;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.card}
                  onPress={() => toggleExpand(item.id)}
                  activeOpacity={0.8}
                >
                  <View style={styles.cardHeader}>
                    <StyledText style={styles.title}>{item.titulo}</StyledText>
                    {canModify && (
                      <View style={styles.actionButtonsContainer}>
                        <TouchableOpacity
                          onPress={() => handleEditReceita(item.id)}
                          style={styles.editButton}
                        >
                          <Ionicons name="create-outline" size={20} color="#464193" />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteReceita(item.id, item.idUsuario)}
                          style={styles.deleteButton}
                        >
                          <Ionicons name="trash-outline" size={20} color="red" />
                        </TouchableOpacity>
                      </View>
                    )}
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#464193"
                    />
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedContent}>
                      {validPhotos.length > 0 ? (
                        <TouchableOpacity
                          onPress={() => handleImagePress(item.id, validPhotos.length - (hasVideo ? 1 : 0), hasVideo, currentMedia)}
                          activeOpacity={0.7}
                        >
                          <Image
                            source={{ uri: currentMedia.uri }}
                            style={styles.image}
                            resizeMode="cover"
                          />
                          {canCycleImages && (
                            <View style={styles.imageCounter}>
                              <StyledText style={styles.counterText}>
                                {currentIndex + 1}/{validPhotos.length}
                              </StyledText>
                            </View>
                          )}
                          {currentMedia.type === 'video' && (
                            <View style={styles.videoOverlay}>
                              <Ionicons name="play-circle" size={50} color="#fff" />
                              <StyledText style={styles.platformBadge}>
                                {currentMedia.platform === 'youtube' ? 'YouTube' :
                                  currentMedia.platform === 'tiktok' ? 'TikTok' :
                                    currentMedia.platform === 'telegram' ? 'Telegram' : 'Vídeo'}
                              </StyledText>
                            </View>
                          )}
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.image, styles.placeholderImage]}>
                          <Ionicons name="image-outline" size={50} color="#ccc" />
                          <StyledText style={styles.placeholderText}>Sem imagem disponível</StyledText>
                        </View>
                      )}

                      <StyledText style={styles.description}>
                        {videoUrl
                          ? item.conteudo.replace(videoUrl, '').trim()
                          : item.conteudo.trim()}
                      </StyledText>

                      <View style={styles.infoContainer}>
                        {videoUrl && (
                          <StyledText style={styles.infoDetail}>
                            <StyledText style={styles.infoLabel}>Link do Vídeo: </StyledText>
                            <StyledText style={styles.videoLinkText} onPress={() => openVideoLink(videoUrl)}>
                              {videoUrl.length > 50 ? `${videoUrl.substring(0, 50)}...` : videoUrl}
                            </StyledText>
                          </StyledText>
                        )}
                        {item.dataCriacao && (
                          <StyledText style={styles.infoDetail}>
                            <StyledText style={styles.infoLabel}>Data de Criação: </StyledText>
                            {formatDate(item.dataCriacao)}
                          </StyledText>
                        )}
                        {item.isverify && (
                          <StyledText style={styles.verifiedBadge}>Verificado</StyledText>
                        )}
                      </View>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          ) : (
            <StyledText style={styles.emptyMessage}>Nenhuma receita encontrada</StyledText>
          )}
        </ScrollView>
      )}

      {/* O botão de criar receitas só aparece para monitores */}
      {isCurrentUserMonitor && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('CreateReceitas')}
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
    backgroundColor: '#464193',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  counterText: {
    color: '#fff',
    fontSize: 12,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  platformBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    fontSize: 12,
  },
  videoLinkText: {
    color: '#0000EE',
    textDecorationLine: 'underline',
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
  image: {
    width: '100%',
    height: width * 0.55,
    borderRadius: 12,
    marginBottom: 10,
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    marginTop: 8,
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
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  infoDetail: {
    fontSize: 13,
    color: '#333',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    color: '#464193',
  },
  youtubeLinkText: {
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