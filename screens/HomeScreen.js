import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  Linking,

} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

import StyledText from '../src/components/StyledText';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
})

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';
const secondaryColor = '#6A5ACD';

export default function Home() {
  const navigation = useNavigation();
  const [userName, setUserName] = useState('Usuário');
  const [dailyTip, setDailyTip] = useState(null);
  const [dailyRecipe, setDailyRecipe] = useState(null);
  const [loadingDailyContent, setLoadingDailyContent] = useState(true);
  const [isTipExpanded, setIsTipExpanded] = useState(false);
  const [isRecipeExpanded, setIsRecipeExpanded] = useState(false);
  const [userProfileImage, setUserProfileImage] = useState(null);
  const [dailyRecipeThumbnailUrl, setDailyRecipeThumbnailUrl] = useState(null);
  const [expoPushToken, setExpoPushToken] = useState('');

    const notificationListener = useRef();
  // Regex abrangente para encontrar URLs completas do YouTube (para extração do link do conteúdo)
  const youtubeUrlRegex = /(https?:\/\/(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([a-zA-Z0-9_-]{11}))/i;

  const hasNumberInTitle = (item) => {
    return item && item.titulo && /\d/.test(item.titulo);
  };

  const notificationsListener = Notifications.addNotificationReceivedListener(notifications => {
    console.log('Notificação recebida:', notifications);
  });

  const responseListener = Notifications.addNotificationResponseReceivedListener(notificationsListener);

  async function resgisterForPushNotificationsAsync() {
  let token;
  
  // Adicione esta verificação para permitir no emulador durante desenvolvimento
  const isDevelopment = __DEV__;
  
  if (Constants.isDevice || isDevelopment) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      if (!isDevelopment) { // Só mostra alerta em produção
        Alert.alert('Permissão de Notificação', 'Precisamos da permissão para enviar notificações.');
      }
      return null;
    }
  }
  
    // Configuração do canal para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        sound: 'default',
        showBadge: true,
        enableLights: true,
        enableVibrate: true,
      });
    }
  
    // Obter token
    try {
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: '76a68f84-e4fe-41fd-8afd-9d4eddea0a75' // Substituído pelo projectId real
      })).data;
  
      console.log('Token de notificação gerado:', token);
      return token;
    } catch (error) {
      console.error('Erro ao obter token:', error);
      return null;
    }
  }
  async function schedulePushNotification(title, body, data = {}) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: true,
          vibrate: [0, 250, 250, 250],
          data: data,
        },
        trigger: { seconds: 1 },
      });
      console.log('Notificação agendada com sucesso');
    } catch (error) {
      console.error('Erro ao agendar notificação:', error);
    }
  }

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
      console.error('[loadUserProfileImage] Erro ao carregar imagem de perfil do usuário na Home:', error);
      setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
    }
  }, []);

  const fetchUserName = useCallback(async () => {
    try {
      const userEmail = await AsyncStorage.getItem('@currentUserEmail');
      const userToken = await AsyncStorage.getItem('userToken');
      const userId = await AsyncStorage.getItem('@currentUserId');

      let nameFoundLocally = false;
      if (userEmail) {
        const storedData = await AsyncStorage.getItem(`@userData:${userEmail}`);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          if (parsedData.nome && parsedData.nome.trim() !== '') {
            setUserName(parsedData.nome);
            nameFoundLocally = true;
          }
        }
      }

      if (!nameFoundLocally && userEmail && userToken) {
        try {
          const response = await api.get(`/api/usuario/${userId}`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });
          const apiUserName = response.data?.user?.nome;
          if (apiUserName && apiUserName.trim() !== '') {
            setUserName(apiUserName);
            await AsyncStorage.setItem(`@userData:${userEmail}`, JSON.stringify({ nome: apiUserName }));
          } else {
            setUserName('Usuário');
          }
          const apiUserImage = response.data?.user?.foto_usuario;
          if (apiUserImage) {
            setUserProfileImage({ uri: apiUserImage }); 
            await AsyncStorage.setItem(`@userImage_${userEmail}`, apiUserImage);
          } else {
            setUserProfileImage(require('../assets/iconsLogin/carinhabranco.jpg'));
          }
        } catch (apiError) {
          console.error('[fetchUserName] Erro ao buscar nome do usuário da API:', apiError.response?.data || apiError.message);
          setUserName('Usuário');
        }
      } else if (!nameFoundLocally && (!userEmail || !userToken)) {
        setUserName('Usuário');
      }
    } catch (error) {
      console.error('[fetchUserName] Erro geral em fetchUserName:', error);
      setUserName('Usuário');
    }
  }, []);

  const getYouTubeThumbnail = useCallback((fullYouTubeUrl) => {
    if (!fullYouTubeUrl || typeof fullYouTubeUrl !== 'string') {
      return null;
    }
    const match = fullYouTubeUrl.match(youtubeUrlRegex);
    const videoId = (match && match[2]) ? match[2] : null;

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  }, []);

  const openYouTubeLink = useCallback((fullYouTubeUrl) => {
    if (fullYouTubeUrl) {
      Linking.openURL(fullYouTubeUrl).catch(err => Alert.alert('Erro', 'Não foi possível abrir o link do YouTube.'));
    } else {
      Alert.alert('Erro', 'Nenhum link do YouTube válido encontrado para abrir.');
    }
  }, []);

  const extractYouTubeUrlAndCleanContent = (content) => {
    if (!content || typeof content !== 'string') {
      return { cleanedContent: '', youtubeLink: null };
    }
    const match = content.match(youtubeUrlRegex);
    const youtubeLink = match ? match[1] : null;
    const globalYoutubeUrlRegex = new RegExp(youtubeUrlRegex.source, 'gi');
    const cleanedContent = content.replace(globalYoutubeUrlRegex, '').trim();
    return { cleanedContent, youtubeLink };
  };

  const getRandomItem = (array) => {
    if (!array || array.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
  };

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
      await AsyncStorage.removeItem('@dailyTipId');
      await AsyncStorage.removeItem('@dailyRecipeId');
    }

    let allTipsFromApi = [];
    let allRecipesFromApi = [];

    try {
      const [tipsResponse, recipesResponse] = await Promise.all([
        api.get('/api/Moda/dicas').catch(err => { console.error('[fetchDailyContent] Erro ao buscar todas as dicas:', err); return null; }),
        api.get('/api/Moda/receitas').catch(err => { console.error('[fetchDailyContent] Erro ao buscar todas as receitas:', err); return null; }),
      ]);

      allTipsFromApi = tipsResponse?.data?.dicas || [];
      allRecipesFromApi = (recipesResponse?.data && recipesResponse.data.receitas) ? recipesResponse.data.receitas : (recipesResponse?.data || []);

      const availableTips = allTipsFromApi.filter(hasNumberInTitle);
      const availableRecipes = allRecipesFromApi.filter(recipe => {
        const { youtubeLink } = extractYouTubeUrlAndCleanContent(recipe.conteudo);
        return hasNumberInTitle(recipe) && youtubeLink && getYouTubeThumbnail(youtubeLink);
      });

      if (lastFetchDate === today && savedDailyTipTitle && savedDailyRecipeTitle) {
        tipToSet = availableTips.find(tip => tip.titulo === savedDailyTipTitle);
        recipeToSet = availableRecipes.find(recipe => recipe.titulo === savedDailyRecipeTitle);
        if (!tipToSet || !recipeToSet) {
          needsNewSelection = true;
        }
      } else {
        needsNewSelection = true;
      }

      if (needsNewSelection || !tipToSet || !recipeToSet) {
        tipToSet = getRandomItem(availableTips);
        recipeToSet = getRandomItem(availableRecipes);

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
      }

    } catch (error) {
      console.error('[fetchDailyContent] Erro geral ao buscar ou carregar conteúdo diário:', error);
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
  }, [getYouTubeThumbnail]);

  // Efeito para processar a URL da thumbnail quando dailyRecipe é atualizado
  useEffect(() => {
    if (dailyRecipe && dailyRecipe.conteudo) {
      const { youtubeLink } = extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo);
      const url = youtubeLink ? getYouTubeThumbnail(youtubeLink) : null;
      setDailyRecipeThumbnailUrl(url);
    } else {
      setDailyRecipeThumbnailUrl(null);
    }

    // Configurar listeners de notificação
    const setupNotifications = async () => {
      const token = await resgisterForPushNotificationsAsync();
      if (token) {
        setExpoPushToken(token);
      }

      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('Notificação recebida:', notification);
      });

      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notificação respondida:', response);
      });
    };

    setupNotifications();

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, [dailyRecipe, getYouTubeThumbnail]);
  useFocusEffect(
    useCallback(() => {
      fetchUserName();
      loadUserProfileImage();
      fetchDailyContent();

      return () => {
      };
    }, [fetchUserName, loadUserProfileImage, fetchDailyContent])
  );

  return (
    <View style={styles.container}>
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
        <StyledText style={styles.welcomeText}>Olá, {userName}!</StyledText>
        <TouchableOpacity style={styles.settingsButton} onPress={() => navigation.navigate('ConfiguracoesStack', { screen: 'ConfiguracoesMain' })}>
          <Ionicons name="settings-outline" size={width * 0.08} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <StyledText style={styles.sectionTitle}>Dica do Dia</StyledText>
        {loadingDailyContent ? (
          <ActivityIndicator size="small" color="#464193" style={styles.loadingIndicator} />
        ) : dailyTip ? (
          <TouchableOpacity style={styles.dailyCard} onPress={() => setIsTipExpanded(!isTipExpanded)} activeOpacity={0.8}>
            <StyledText style={styles.dailyCardTitle}>{dailyTip.titulo}</StyledText>
            <StyledText style={styles.dailyCardContent} numberOfLines={isTipExpanded ? 0 : 3}>
              {dailyTip.conteudo}
            </StyledText>
            {isTipExpanded && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Dicas' })}
              >
                <StyledText style={styles.viewMoreButtonText}>Ver todas as Dicas</StyledText>
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
          <StyledText style={styles.noContentText}>Nenhuma dica disponível hoje.</StyledText>
        )}

        <StyledText style={styles.sectionTitle}>Receita do Dia</StyledText>
        {loadingDailyContent ? (
          <ActivityIndicator size="small" color="#464193" style={styles.loadingIndicator} />
        ) : dailyRecipe ? (
          <TouchableOpacity style={styles.dailyCard} onPress={() => setIsRecipeExpanded(!isRecipeExpanded)} activeOpacity={0.8}>
            {dailyRecipeThumbnailUrl ? (
              <Image
                source={{ uri: dailyRecipeThumbnailUrl }}
                style={styles.dailyCardImage}
                resizeMode="cover"
                onError={(e) => {
                  console.error('[dailyCardImage] Erro ao carregar imagem da receita:', e.nativeEvent.error, 'URL:', dailyRecipeThumbnailUrl);
                  Alert.alert('Erro de Imagem', 'Não foi possível carregar a miniatura do vídeo.');
                  setDailyRecipeThumbnailUrl(null); // Define como null para mostrar o placeholder
                }}
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="videocam-off-outline" size={50} color="#ccc" />
                <StyledText style={styles.imagePlaceholderText}>Vídeo Não Disponível</StyledText>
              </View>
            )}
            <StyledText style={styles.dailyCardTitle}>{dailyRecipe.titulo}</StyledText>
            <StyledText style={styles.dailyCardContent} numberOfLines={isRecipeExpanded ? 0 : 3}>
              {extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo).cleanedContent}
            </StyledText>
            {isRecipeExpanded && extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo).youtubeLink && (
              <StyledText style={styles.info}>
                <StyledText style={styles.label}>Vídeo: </StyledText>
                <StyledText
                  style={styles.youtubeLink}
                  onPress={() => openYouTubeLink(extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo).youtubeLink)}
                >
                  {extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo).youtubeLink.length > 50 ? `${extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo).youtubeLink.substring(0, 50)}...` : extractYouTubeUrlAndCleanContent(dailyRecipe.conteudo).youtubeLink}
                </StyledText>
              </StyledText>
            )}
            {isRecipeExpanded && (
              <TouchableOpacity
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Receitas' })}
              >
                <StyledText style={styles.viewMoreButtonText}>Ver todas as Receitas</StyledText>
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
          <StyledText style={styles.noContentText}>Nenhuma receita disponível hoje.</StyledText>
        )}

        <View style={styles.buttonGrid}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Receitas' })}
          >
            <Ionicons name="book-outline" size={width * 0.1} color="#fff" />
            <StyledText style={styles.navButtonText}>Receitas de Moda</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('Dicas/Receitas', { screen: 'Dicas' })}
          >
            <Ionicons name="bulb-outline" size={width * 0.1} color="#fff" />
            <StyledText style={styles.navButtonText}>Dicas de Moda</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('OutrosStack', { screen: 'quiz' })}
          >
            <Ionicons name="game-controller-outline" size={width * 0.1} color="#fff" />
            <StyledText style={styles.navButtonText}>Quiz</StyledText>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigation.navigate('ConfiguracoesStack', { screen: 'Sobre' })}
          >
            <Ionicons name="information-circle-outline" size={width * 0.1} color="#fff" />
            <StyledText style={styles.navButtonText}>Sobre</StyledText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

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
    fontSize: width * 0.05,
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
  imagePlaceholder: {
    width: '100%',
    height: height * 0.18,
    borderRadius: 10,
    marginBottom: height * 0.015,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
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
  info: {
    fontSize: width * 0.038,
    color: '#333',
    marginBottom: height * 0.005,
    textAlign: 'center',
  },
  label: {
    fontWeight: 'bold',
    color: primaryColor,
  },
  youtubeLink: {
    color: '#0000EE',
    textDecorationLine: 'underline',
  },
  imagePlaceholderText: {
    color: '#888',
    marginTop: 5,
    fontSize: width * 0.035,
  },
});
