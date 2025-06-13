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

  const getRandomItem = (items) => {
    const randomIndex = Math.floor(Math.random() * items.length);
    return items[randomIndex];
  };

  // Regex para encontrar URLs do YouTube no texto do conteúdo
  const youtubeUrlRegex = /(https?:\/\/(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([a-zA-Z0-9_-]{11}))/i;


  // Função auxiliar para verificar se o título contém um número
  const hasNumberInTitle = (item) => {
    return item && item.titulo && /\d/.test(item.titulo);
  };

  // Função para carregar a imagem de perfil do usuário
  const loadUserProfileImage = useCallback(async () => {
    try {
      const userEmail = await AsyncStorage.getItem('@currentUserEmail');
      if (userEmail) {
        const savedImageUri = await AsyncStorage.getItem(`@userImage_${userEmail}`);
        if (savedImageUri) {
          setUserProfileImage({ uri: savedImageUri });
        } else {
          setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
        }
      } else {
        setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
      }
    } catch (error) {
      console.error('Erro ao carregar imagem de perfil do usuário na Home:', error);
      setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
    }
  }, []);

  // Função para buscar o nome do usuário - ADICIONADO LOGS DE DEBUG
  const fetchUserName = useCallback(async () => {
    console.log('--- Iniciando fetchUserName ---');
    try {
      const userEmail = await AsyncStorage.getItem('@currentUserEmail');
      console.log('User Email from AsyncStorage:', userEmail);

      if (userEmail) {
        const storedData = await AsyncStorage.getItem(`@userData:${userEmail}`);
        console.log('Stored Data for userEmail:', storedData);

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          console.log('Parsed User Data:', parsedData);

          if (parsedData.nome) {
            setUserName(parsedData.nome);
            console.log('UserName set to:', parsedData.nome);
          } else {
            console.log('Nome não encontrado em parsedData.');
          }
        } else {
          console.log('Nenhum dado encontrado para este userEmail no AsyncStorage.');
        }
      } else {
        console.log('userEmail não encontrado no AsyncStorage.');
        setUserName('Usuário'); // Garante que o nome padrão seja exibido se o email não for encontrado
      }
    } catch (error) {
      console.error('Erro ao buscar nome do usuário:', error);
      setUserName('Usuário'); // Fallback em caso de erro
    }
    console.log('--- Finalizando fetchUserName ---');
  }, []);

  // Função para extrair o ID do vídeo do YouTube do conteúdo e retornar a URL da thumbnail
  const getYouTubeThumbnail = (content) => {
    if (!content || typeof content !== 'string') {
      console.log('getYouTubeThumbnail: Conteúdo de entrada inválido ou não é string.', content);
      return null;
    }
    const match = content.match(youtubeUrlRegex);
    const videoId = match && match[2] ? match[2] : null;
    
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  };

  // Função para buscar a dica e a receita do dia
  const fetchDailyContent = useCallback(async () => {
    setLoadingDailyContent(true);
    const today = new Date().toISOString().slice(0, 10);

    let tipToSet = null;
    let recipeToSet = null;
    let needsNewSelection = false;

    const lastFetchDate = await AsyncStorage.getItem('@lastDailyContentFetchDate');
    let savedDailyTipTitle = await AsyncStorage.getItem('@dailyTipTitle');
    let savedDailyRecipeTitle = await AsyncStorage.getItem('@dailyRecipeTitle');


    const oldTipId = await AsyncStorage.getItem('@dailyTipId');
    const oldRecipeId = await AsyncStorage.getItem('@dailyRecipeId');
    if (oldTipId || oldRecipeId) {
        console.log('Detectando IDs antigos. Removendo-os...');
        await AsyncStorage.removeItem('@dailyTipId');
        await AsyncStorage.removeItem('@dailyRecipeId');
    }

    let allTipsFromApi = [];
    let allRecipesFromApi = [];

    try {
        const [tipsResponse, recipesResponse] = await Promise.all([
            api.get('/api/Moda/dicas').catch(err => { console.error('Erro ao buscar todas as dicas:', err); return null; }),
            api.get('/api/Moda/receitas').catch(err => { console.error('Erro ao buscar todas as receitas:', err); return null; }),
        ]);

        allTipsFromApi = tipsResponse?.data?.dicas || [];
        allRecipesFromApi = (recipesResponse?.data && recipesResponse.data.receitas) ? recipesResponse.data.receitas : (recipesResponse?.data || []);

        // Filtra receitas e dicas que têm um número no título
        const availableTips = allTipsFromApi.filter(hasNumberInTitle);
        // Filtra receitas que têm um número no título E um link de YouTube válido no conteúdo
        const availableRecipes = allRecipesFromApi.filter(recipe => 
            hasNumberInTitle(recipe) && getYouTubeThumbnail(recipe.conteudo) // Verifica se o conteúdo tem um link válido
        );
        console.log('Dicas filtradas com número no título:', availableTips.length);
        console.log('Receitas filtradas com número no título e URL válida no conteúdo:', availableRecipes.length);


        if (lastFetchDate === today && savedDailyTipTitle && savedDailyRecipeTitle) {
            console.log('Conteúdo diário já salvo para hoje. Tentando carregar por título...');
            
            tipToSet = availableTips.find(tip => tip.titulo === savedDailyTipTitle);
            recipeToSet = availableRecipes.find(recipe => recipe.titulo === savedDailyRecipeTitle);

            if (tipToSet) {
                console.log('Dica salva carregada por título:', tipToSet.titulo);
            } else {
                console.warn('Dica salva por título não encontrada. Marcando para nova seleção.');
                needsNewSelection = true;
            }

            if (recipeToSet) {
                console.log('Receita salva carregada por título:', recipeToSet.titulo);
            } else {
                console.warn('Receita salva por título não encontrada. Marcando para nova seleção.');
                needsNewSelection = true;
            }
        } else {
            console.log('Data mudou ou títulos salvos ausentes. Marcando para nova seleção.');
            needsNewSelection = true;
        }

        if (needsNewSelection || !tipToSet || !recipeToSet) {
            console.log('Realizando nova seleção aleatória de conteúdo diário...');
            tipToSet = getRandomItem(availableTips);
            recipeToSet = getRandomItem(availableRecipes);

            // Salva a nova seleção para hoje
            await AsyncStorage.setItem('@lastDailyContentFetchDate', today);
            if (tipToSet) {
                await AsyncStorage.setItem('@dailyTipTitle', tipToSet.titulo);
            } else {
                await AsyncStorage.removeItem('@dailyTipTitle');
            }
            if (recipeToSet) {
                await AsyncStorage.setItem('@dailyRecipeTitle', recipeToSet.titulo);
            } else {
                await AsyncStorage.removeItem('@dailyRecipeTitle');
            }
            console.log('Novo conteúdo diário definido e salvo no AsyncStorage.');

        } else {
            console.log('Conteúdo diário carregado com sucesso do cache/salvo para hoje. Nenhuma nova busca completa necessária.');
        }

    } catch (error) {
      console.error('Erro geral ao buscar ou carregar conteúdo diário:', error);
      Alert.alert('Erro', 'Não foi possível carregar o conteúdo do dia. Tente novamente mais tarde.');
      tipToSet = null;
      recipeToSet = null;
    } finally {
      setDailyTip(tipToSet);
      setDailyRecipe(recipeToSet);
      setIsTipExpanded(false);
      setIsRecipeExpanded(false);
      setLoadingDailyContent(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('HomeScreen: useFocusEffect acionado.');
      fetchUserName();
      loadUserProfileImage();
      fetchDailyContent();
      return () => {
        console.log('HomeScreen: useFocusEffect cleanup.');
      };
    }, [fetchUserName, loadUserProfileImage, fetchDailyContent])
  );

  return (
    <View style={styles.container}>
      {/* Header com boas-vindas */}
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
                onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'DicasDeModa' })}
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
            {/* Renderiza a imagem da thumbnail do YouTube se o link for encontrado no conteúdo */}
            {getYouTubeThumbnail(dailyRecipe.conteudo) ? (
              <Image
                source={{ uri: getYouTubeThumbnail(dailyRecipe.conteudo) }}
                style={styles.dailyCardImage}
                resizeMode="cover"
                onError={(e) => console.log('Erro ao carregar imagem da receita:', e.nativeEvent.error)}
              />
            ) : ( // Placeholder se não houver thumbnail ou link
              <Image
                source={{ uri: `https://placehold.co/${width * 0.8}x${height * 0.18}/cccccc/333333?text=Video+Nao+Disponivel` }}
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
                onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'ReceitasDeModa' })}
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
            onPress={() => navigation.getParent()?.navigate('Quiz')}
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
