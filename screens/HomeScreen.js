import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Usuário');
  const [dailyTip, setDailyTip] = useState(null);
  const [dailyRecipe, setDailyRecipe] = useState(null);
  const [loadingDailyContent, setLoadingDailyContent] = useState(true);
  const [isTipExpanded, setIsTipExpanded] = useState(false);
  const [isRecipeExpanded, setIsRecipeExpanded] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);

  // Função para carregar a imagem de perfil do usuário
  const loadUserProfileImage = useCallback(async () => {
    try {
      const userEmail = await AsyncStorage.getItem('@currentUserEmail');
      if (userEmail) {
        const savedImageUri = await AsyncStorage.getItem(`@userImage_${userEmail}`);
        if (savedImageUri) {
          setUserProfileImage({ uri: savedImageUri });
        } else {
          // Se não houver imagem salva, use uma imagem padrão local
          setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
        }
      } else {
        // Se não houver usuário logado, use uma imagem padrão
        setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
      }
    } catch (error) {
      console.error('Erro ao carregar imagem de perfil do usuário na Home:', error);
      setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
    }
  }, []);

  // Função para buscar o nome do usuário
  const fetchUserName = useCallback(async () => {
    try {
      const userEmail = await AsyncStorage.getItem('@currentUserEmail');
      if (userEmail) {
        const storedData = await AsyncStorage.getItem(`@userData:${userEmail}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.nome) {
            setUserName(parsedData.nome);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
    }
  }, []);

  // Função para pegar um item aleatório de um array
  const getRandomItem = (array) => {
    if (!array || array.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

  // Função para extrair o ID do vídeo do YouTube e retornar a URL da thumbnail
  const getYouTubeThumbnail = (youtubeUrl) => {
    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      console.log('getYouTubeThumbnail: URL de entrada inválida ou não é string.', youtubeUrl);
      return null;
    }
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
    const match = youtubeUrl.match(regExp);
    const videoId = match && match[1] ? match[1] : null;
    console.log('YouTube URL de entrada:', youtubeUrl);
    console.log('ID de Vídeo Extraído:', videoId);

    if (videoId) {
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      console.log('URL da Miniatura Gerada:', thumbnailUrl);
      return thumbnailUrl;
    }
    console.log('Nenhum ID de Vídeo válido encontrado na URL fornecida, retornando miniatura nula.');
    return null;
  };

  // Função para buscar a dica e a receita do dia
  const fetchDailyContent = useCallback(async () => {
    setLoadingDailyContent(true);
    const today = new Date().toISOString().slice(0, 10);

    try {
      const lastFetchDate = await AsyncStorage.getItem('@lastDailyContentFetchDate');
      let savedDailyTipId = await AsyncStorage.getItem('@dailyTipId');
      let savedDailyRecipeId = await AsyncStorage.getItem('@dailyRecipeId');

      let tipToSet = null;
      let recipeToSet = null;

      // Tenta carregar conteúdo do dia se já foi salvo
      if (lastFetchDate === today && savedDailyTipId && savedDailyRecipeId) {
        console.log('Conteúdo diário já salvo para hoje. Tentando carregar...');

        try {
          const tipResponse = await api.get(`/api/dicas/${savedDailyTipId}`);
          if (tipResponse && tipResponse.data) {
            tipToSet = tipResponse.data;
            console.log('Dica salva carregada:', tipToSet.titulo);
          } else {
            console.warn('Dica salva não encontrada ou falha ao carregar (dados ausentes na resposta da API). Buscando nova.');
            savedDailyTipId = null;
          }
        } catch (err) {
          console.error('Erro ao buscar dica salva por ID:', savedDailyTipId, 'Erro:', err.response?.data || err.message);
          savedDailyTipId = null;
        }

        try {
          const recipeResponse = await api.get(`/api/receitas/${savedDailyRecipeId}`);
          if (recipeResponse && recipeResponse.data) {
            const fetchedRecipe = recipeResponse.data.receita || recipeResponse.data; 
            if (fetchedRecipe && fetchedRecipe.fotos && fetchedRecipe.fotos.length > 0 && typeof fetchedRecipe.fotos[0] === 'string') {
              recipeToSet = fetchedRecipe;
              console.log('Receita salva carregada:', recipeToSet.titulo);
            } else {
              console.warn('Receita salva encontrada, mas sem URL de foto/vídeo válida. Buscando nova.');
              recipeToSet = null; // Força nova busca
              savedDailyRecipeId = null;
            }
          } else {
            console.warn('Receita salva não encontrada ou falha ao carregar (dados ausentes na resposta da API). Buscando nova.');
            savedDailyRecipeId = null;
          }
        } catch (err) {
          console.error('Erro ao buscar receita salva por ID:', savedDailyRecipeId, 'Erro:', err.response?.data || err.message);
          savedDailyRecipeId = null;
        }
      }

      // Se não há conteúdo salvo para hoje ou falhou ao carregar, busca novo
      if (lastFetchDate !== today || !tipToSet || !recipeToSet) {
        console.log('Buscando novo conteúdo diário...');
        const [tipsResponse, recipesResponse] = await Promise.all([
          api.get('/api/Moda/dicas').catch(err => { console.error('Erro ao buscar todas as dicas:', err); return null; }),
          api.get('/api/Moda/receitas').catch(err => { console.error('Erro ao buscar todas as receitas:', err); return null; }),
        ]);

        const allTips = tipsResponse?.data || [];
        let allRecipes = (recipesResponse?.data && recipesResponse.data.receitas) ? recipesResponse.data.receitas : (recipesResponse?.data || []);
        allRecipes = allRecipes.filter(recipe => 
          recipe.fotos && recipe.fotos.length > 0 && typeof recipe.fotos[0] === 'string'
        );
        console.log('Receitas filtradas com URL de foto/vídeo válidas para seleção:', allRecipes.length, allRecipes);


        tipToSet = getRandomItem(allTips);
        recipeToSet = getRandomItem(allRecipes); // Seleciona apenas de receitas válidas

        await AsyncStorage.setItem('@lastDailyContentFetchDate', today);
        if (tipToSet) {
          await AsyncStorage.setItem('@dailyTipId', tipToSet.id);
        } else {
          await AsyncStorage.removeItem('@dailyTipId');
        }
        if (recipeToSet) {
          await AsyncStorage.setItem('@dailyRecipeId', recipeToSet.id);
        } else {
          await AsyncStorage.removeItem('@dailyRecipeId');
        }
        console.log('Novo conteúdo diário definido e salvo.');
      }

      setDailyTip(tipToSet);
      setDailyRecipe(recipeToSet);
      setIsTipExpanded(false);
      setIsRecipeExpanded(false);

    } catch (error) {
      console.error('Erro geral ao buscar ou carregar conteúdo diário:', error);
      Alert.alert('Erro', 'Não foi possível carregar o conteúdo do dia. Tente novamente mais tarde.');
    } finally {
      setLoadingDailyContent(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserName();
      loadUserProfileImage();
      fetchDailyContent();
      return () => {};
    }, [fetchUserName, loadUserProfileImage, fetchDailyContent])
  );

  return (
    <View style={styles.container}>
      {/* Cabeçalho com boas-vindas */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.profileButton} onPress={() => navigation.navigate('Perfil')}>
          {userProfileImage ? (
            <Image
              source={userProfileImage}
              style={styles.headerProfileImage}
            />
          ) : (
            <Ionicons name="person-circle-outline" size={width * 0.12} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Olá, {userName}!</Text>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('ConfiguracoesStack', { screen: 'ConfiguracoesMain' })}>
          <Ionicons name="settings-outline" size={width * 0.08} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Seção "Dica do Dia" */}
        <Text style={styles.sectionTitle}>Dica do Dia</Text>
        {loadingDailyContent ? (
          <ActivityIndicator size="small" color="#464193" style={styles.loadingIndicator} />
        ) : dailyTip ? (
          <TouchableOpacity style={styles.dailyCard} onPress={() => setIsTipExpanded(!isTipExpanded)} activeOpacity={0.8}>
            <Text style={styles.dailyCardTitle}>{dailyTip.titulo}</Text>
            <Text style={styles.dailyCardContent} numberOfLines={isTipExpanded ? 0 : 3}>
              {dailyTip.conteudo}
            </Text>
            {isTipExpanded && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Dicas' })}
              >
                <Text style={styles.viewMoreButtonText}>Ver todas as Dicas</Text>
              </TouchableOpacity>
            )}
            <Ionicons
              name={isTipExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={primaryColor}
              style={styles.expandIcon}
            />
          </TouchableOpacity>
        ) : (
          <Text style={styles.noContentText}>Nenhuma dica disponível hoje.</Text>
        )}

        {/* Seção "Receita do Dia" */}
        <Text style={styles.sectionTitle}>Receita do Dia</Text>
        {loadingDailyContent ? (
          <ActivityIndicator size="small" color="#464193" style={styles.loadingIndicator} />
        ) : dailyRecipe ? (
          <TouchableOpacity style={styles.dailyCard} onPress={() => setIsRecipeExpanded(!isRecipeExpanded)} activeOpacity={0.8}>
            {dailyRecipe.fotos && dailyRecipe.fotos.length > 0 ? (
              <Image
                source={{ uri: getYouTubeThumbnail(dailyRecipe.fotos[0]) || `https://placehold.co/${width * 0.8}x${height * 0.18}/cccccc/333333?text=Imagem+Nao+Disponivel` }}
                style={styles.dailyCardImage}
                resizeMode="cover"
                onError={(e) => console.log('Erro ao carregar imagem da receita:', e.nativeEvent.error)}
              />
            ) : (
              // Fallback para imagem placeholder se não houver fotos
              <Image
                source={{ uri: `https://tocoringandooo/${width * 0.8}x${height * 0.18}/cccccc/333333?text=Imagem+Nao+Disponivel` }}
                style={styles.dailyCardImage}
                resizeMode="cover"
              />
            )}
            <Text style={styles.dailyCardTitle}>{dailyRecipe.titulo}</Text>
            <Text style={styles.dailyCardContent} numberOfLines={isRecipeExpanded ? 0 : 3}>
              {dailyRecipe.conteudo}
            </Text>
            {isRecipeExpanded && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Receitas' })}
              >
                <Text style={styles.viewMoreButtonText}>Ver todas as Receitas</Text>
              </TouchableOpacity>
            )}
            <Ionicons
              name={isRecipeExpanded ? 'chevron-up' : 'chevron-down'}
              size={24}
              color={primaryColor}
              style={styles.expandIcon}
            />
          </TouchableOpacity>
        ) : (
          <Text style={styles.noContentText}>Nenhuma receita disponível hoje.</Text>
        )}

        {/* Botões de Navegação Principais */}
        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Receitas' })}
          >
            <Ionicons name="book-outline" size={width * 0.1} color="#fff" />
            <Text style={styles.navButtonText}>Receitas de Moda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Dicas' })}
          >
            <Ionicons name="bulb-outline" size={width * 0.1} color="#fff" />
            <Text style={styles.navButtonText}>Dicas de Moda</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.getParent()?.navigate('OutrosStack', { screen: 'quiz' })}
          >
            <Ionicons name="game-controller-outline" size={width * 0.1} color="#fff" />
            <Text style={styles.navButtonText}>Quiz</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ConfiguracoesStack', {screen: 'Sobre'})}
          >
            <Ionicons name="information-circle-outline" size={width * 0.1} color="#fff" />
            <Text style={styles.navButtonText}>Sobre</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const primaryColor = '#464193';
const secondaryColor = '#6A5ACD';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: primaryColor,
    paddingHorizontal: width * 0.05,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
    borderBottomLeftRadius: width * 0.08,
    borderBottomRightRadius: width * 0.08,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileButton: {
    padding: width * 0.01,
  },
  headerProfileImage: {
    width: width * 0.12,
    height: width * 0.12,
    borderRadius: (width * 0.12) / 2,
    borderWidth: 2,
    borderColor: '#fff',
    resizeMode: 'cover',
  },
  welcomeText: {
    fontSize: width * 0.06,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  settingsButton: {
    padding: width * 0.01,
  },
  scrollViewContent: {
    paddingVertical: height * 0.02,
    paddingHorizontal: width * 0.05,
  },
  sectionTitle: {
    fontSize: width * 0.055,
    fontWeight: 'bold',
    color: primaryColor,
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
    textAlign: 'center',
  },
  dailyCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: height * 0.02,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  dailyCardTitle: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: height * 0.01,
    textAlign: 'center',
  },
  dailyCardContent: {
    fontSize: width * 0.038,
    color: '#555',
    textAlign: 'justify',
    lineHeight: width * 0.055,
    width: '100%',
  },
  dailyCardImage: {
    width: '100%',
    height: height * 0.18,
    borderRadius: 10,
    marginBottom: height * 0.015,
  },
  loadingIndicator: {
    marginTop: height * 0.02,
    marginBottom: height * 0.02,
  },
  noContentText: {
    fontSize: width * 0.04,
    color: '#777',
    textAlign: 'center',
    marginTop: height * 0.01,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: height * 0.03,
  },
  navButton: {
    width: '48%',
    backgroundColor: primaryColor,
    borderRadius: 15,
    padding: width * 0.04,
    marginBottom: width * 0.04,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  navButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    fontWeight: '600',
    marginTop: height * 0.01,
    textAlign: 'center',
  },
  expandIcon: {
    marginTop: 10,
    alignSelf: 'center',
  },
  viewMoreButton: {
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: secondaryColor,
    borderRadius: 8,
  },
  viewMoreButtonText: {
    color: '#fff',
    fontSize: width * 0.035,
    fontWeight: 'bold',
  },
});
