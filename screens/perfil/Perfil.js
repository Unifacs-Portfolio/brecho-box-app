import React, { useState, useEffect } from 'react'; 
import { 
  View, 
  Image, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator, 
  AppState, 
  Dimensions 
} from 'react-native'; 
import { useNavigation } from '@react-navigation/native'; 
import { Ionicons } from '@expo/vector-icons'; 
import * as ImagePicker from 'expo-image-picker'; 
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import api from '../../src/services/api'; 
import * as FileSystem from 'expo-file-system'; 

import StyledText from '../../src/components/StyledText'; 

// Importe das imagens de árvore 
import arvore0 from '../../assets/IconsLevel/arvore0.png'; 
import arvore1 from '../../assets/IconsLevel/arvore1.png'; 
import arvore2 from '../../assets/IconsLevel/arvore2.png'; 
import arvore3 from '../../assets/IconsLevel/arvore3.png'; 
import arvore4 from '../../assets/IconsLevel/arvore4.png'; 

const { width, height } = Dimensions.get('window'); 

export default function Perfil() { 
  const navigation = useNavigation(); 
  const [userImage, setUserImage] = useState(null); 
  const [quizScore, setQuizScore] = useState(0); 
  const [userName, setUserName] = useState(''); 
  const [loading, setLoading] = useState(true); 
  const [currentEmail, setCurrentEmail] = useState(''); 

  // Mapeamento dos ícones baseados na pontuação 
  const treeIcons = [ 
    arvore0, 
    arvore1, 
    arvore2, 
    arvore3, 
    arvore4, 
    arvore4 
  ]; 

  // Mapeamento dos títulos baseados na pontuação 
  const scoreTitles = [ 
    "Semente da Consciência", 
    "Brotinho Sustentável", 
    "Folha Verde", 
    "Raiz Forte", 
    "Árvore Florescendo", 
    "Consumidor Consciente" 
  ]; 

  // Mapeamento dos estilos de badge para cada título de nível 
  const scoreTitleStyles = [ 
    { backgroundColor: '#e0e0e0', color: '#555555' }, 
    { backgroundColor: '#d4edda', color: '#28a745' }, 
    { backgroundColor: '#90EE90', color: '#1a5c2f' }, 
    { backgroundColor: '#B0E0E6', color: '#4682B4' }, 
    { backgroundColor: '#8A2BE2', color: '#FFFFFF' }, 
    { backgroundColor: '#464193', color: '#FFFFFF' } 
  ]; 

  // Função para obter o título do nível e o estilo correspondente 
  const getScoreInfo = (score) => { 
    const index = Math.min(score, scoreTitles.length - 1); 
    return { 
      title: scoreTitles[index], 
      style: scoreTitleStyles[index] 
    }; 
  }; 

  // Função para carregar a imagem padrão 
  const loadDefaultImage = () => { 
    return require('../../assets/iconsLogin/carinhabranco.jpg'); 
  }; 

  // Carrega a imagem salva do AsyncStorage 
  const loadSavedImage = async (email) => { 
    try { 
      const savedImage = await AsyncStorage.getItem(`@userImage_${email}`); 
      if (savedImage) { 
        const fileInfo = await FileSystem.getInfoAsync(savedImage); 
        if (fileInfo.exists) { 
          setUserImage({ uri: savedImage }); 
        } else { 
          setUserImage(loadDefaultImage()); 
          await AsyncStorage.removeItem(`@userImage_${email}`); 
        } 
      } else { 
        setUserImage(loadDefaultImage()); 
      } 
    } catch (error) { 
      console.error('Erro ao carregar imagem:', error); 
      setUserImage(loadDefaultImage()); 
    } 
  }; 

  // Função para buscar os dados do usuário 
  const fetchUserData = async () => { 
    try { 
      setLoading(true); 
      const email = await AsyncStorage.getItem('@currentUserEmail'); 
      const token = await AsyncStorage.getItem('userToken'); 
      const id = await AsyncStorage.getItem('@currentUserId'); 

      if (!email || !token) { 
        throw new Error('Nenhum email ou token encontrado'); 
      } 

      setCurrentEmail(email); 

      await loadSavedImage(email); // Garante que a imagem seja carregada

      const userData = await AsyncStorage.getItem(`@userData:${email}`); 
      if (userData) { 
        const parsedData = JSON.parse(userData); 
        if (parsedData.nome) { 
          setUserName(parsedData.nome); 
        } 
      } 

      const score = await AsyncStorage.getItem('@quizScore'); 
      if (score !== null) { 
        setQuizScore(parseInt(score)); 
      } else { 
        setQuizScore(0); 
      } 

      // Busca o nome do usuário da API para garantir que está atualizado
      const response = await api.get(`/api/usuario/${id}`, { 
          headers: { 
              'Authorization': `Bearer ${token}` 
          } 
      }); 
      if (response.data?.user?.nome) {  
        setUserName(response.data.user.nome); 
        await AsyncStorage.setItem(`@userData:${email}`, JSON.stringify({ 
          nome: response.data.user.nome 
        })); 
      } 
      if(response.data?.user?.foto_usuario){ 
        setUserImage({ uri: response.data.user.foto_usuario }); 
        await AsyncStorage.setItem(`@userImage_${email}`, response.data.user.foto_usuario); 
      }

    } catch (error) { 
      console.error('Erro ao buscar dados do usuário:', error.response?.data || error.message); 
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil'); 
      setUserImage(loadDefaultImage()); 
      setQuizScore(0); 
    } finally { 
      setLoading(false); 
    } 
  }; 

  // Função para selecionar imagem da galeria e enviá-la para a API
  const pickImage = async () => { 
    try { 
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync(); 
      if (status !== 'granted') { 
        Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos!'); 
        return; 
      } 

      const result = await ImagePicker.launchImageLibraryAsync({ 
        mediaTypes: ImagePicker.MediaTypeOptions.Images, 
        allowsEditing: true, 
        aspect: [1, 1], 
        quality: 1, 
      }); 

      if (!result.canceled) { 
        const selectedUri = result.assets[0].uri; 
        const fileName = selectedUri.split('/').pop(); 
        const newFileName = `${Date.now()}_${fileName}`; 
        const newPath = FileSystem.documentDirectory + newFileName; 

        await FileSystem.copyAsync({ from: selectedUri, to: newPath }); 

        const newImage = { uri: newPath }; 
        setUserImage(newImage); 
        await AsyncStorage.setItem(`@userImage_${currentEmail}`, newPath); 

        setLoading(true); 
        const userId = await AsyncStorage.getItem('@currentUserId');
        const userToken = await AsyncStorage.getItem('userToken');

        if (!userId || !userToken) {
          Alert.alert('Erro', 'Não foi possível obter os dados do usuário para enviar a imagem.');
          setLoading(false);
          return;
        }

        const formData = new FormData();
        formData.append('avatar', {
          uri: newPath, 
          name: newFileName, 
          type: 'image/jpeg', 
        });

        try {
          const response = await api.putForm(`/api/usuario/${userId}`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data', 
              'Authorization': `Bearer ${userToken}`,
            },
          });

          console.log('Resposta da API:', response.data);

          if (response.status === 200) {
            Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
          } else {
            Alert.alert('Erro', 'Não foi possível atualizar a foto de perfil na API.');
            console.error('Erro no upload da imagem:', response.data);
          }
        } catch (apiError) {
          console.error('Erro ao enviar imagem para a API:', apiError.response?.data || apiError.message);
          Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor para atualizar a imagem.');
        } finally {
          setLoading(false); 
        }
      } 
    } catch (error) { 
      console.error('Erro ao selecionar imagem:', error); 
      Alert.alert('Erro', 'Não foi possível selecionar a imagem'); 
      setLoading(false); 
    } 
  }; 

  useEffect(() => { 
    const loadData = async () => { 
      try { 
        const email = await AsyncStorage.getItem('@currentUserEmail'); 
        if (email) { 
          await loadSavedImage(email); 
          const score = await AsyncStorage.getItem('@quizScore'); 
          if (score !== null) { 
            setQuizScore(parseInt(score)); 
          } else { 
            setQuizScore(0); 
          } 
          const userData = await AsyncStorage.getItem(`@userData:${email}`); 
          if (userData) { 
            const parsedData = JSON.parse(userData); 
            if (parsedData.nome) { 
              setUserName(parsedData.nome); 
            } 
          } 
        } 
      } catch (error) { 
        console.error('Erro ao carregar dados em loadData:', error); 
      } 
    }; 

    fetchUserData(); 

    const appStateSubscription = AppState.addEventListener('change', (nextAppState) => { 
      if (nextAppState === 'active') { 
        loadData(); 
      } 
    }); 

    const unsubscribeFocus = navigation.addListener('focus', () => { 
      fetchUserData(); 
    }); 

    return () => { 
      appStateSubscription.remove(); 
      unsubscribeFocus(); 
    }; 
  }, [navigation]); 

  if (loading) { 
    return ( 
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f2f2f2' }}> 
        <ActivityIndicator size="large" color={primaryColor} /> 
      </View> 
    ); 
  } 

  const { title: currentScoreTitle, style: currentScoreTitleStyle } = getScoreInfo(quizScore); 

  return ( 
    <View style={styles.container}> 
      <View style={styles.topCurve}> 
        <View style={styles.headerRow}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Home')} 
          > 
            <Ionicons name="arrow-back" size={24} color={'#fff'} /> 
          </TouchableOpacity> 
          <StyledText style={styles.headerTitleAligned}>Perfil</StyledText> 
        </View>

        <View style={styles.profileContent}> 
          {/* Nome do usuário */}
          {userName ? ( 
            <StyledText style={styles.userNameTop}>{userName}</StyledText> 
          ) : ( 
            <StyledText style={styles.userNameTop}>Usuário BrechóBox</StyledText> 
          )} 

          <TouchableOpacity onPress={pickImage}> 
            <View style={styles.profileImageContainer}> 
              <Image 
                source={userImage} 
                style={styles.mainImage} 
              /> 
              <View style={styles.overlayIconContainer}> 
                <Image 
                  source={treeIcons[Math.min(quizScore, treeIcons.length - 1)]} 
                  style={styles.overlayIcon} 
                /> 
              </View> 
            </View> 
          </TouchableOpacity> 
        </View> 
      </View> 

      <View style={styles.bottomContainer}> 
        <StyledText style={styles.quizTitle}>Realize o Quiz para saber seu Título!!</StyledText> 
        <StyledText style={[styles.scoreTitleBadge, currentScoreTitleStyle]}>{currentScoreTitle}</StyledText> 

        <TouchableOpacity 
            style={styles.quizButton} 
            onPress={() => navigation.navigate('OutrosStack', { screen: 'quiz' })} 
        > 
            <Ionicons name="bulb-outline" size={24} color={'#fff'} /> 
            <StyledText style={styles.quizButtonText}>Jogar Quiz</StyledText> 
        </TouchableOpacity> 

        <TouchableOpacity
          style={styles.settingsButtonFloating}
          onPress={() => navigation.navigate('ConfiguracoesStack', { screen: 'ConfiguracoesMain' })} 
        >
          <Ionicons name="settings" size={28} color={'#fff'} />
        </TouchableOpacity>
      </View> 
    </View> 
  ); 
} 

const primaryColor = '#464193'; 

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: '#f2f2f2', 
  }, 
  quizTitle: { 
    color: primaryColor, 
    fontSize: width * 0.05, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginTop: height * 0.03, 
  }, 

  topCurve: { 
    backgroundColor: '#464193', 
    height: height * 0.6, 
    borderBottomLeftRadius: width * 0.5, 
    borderBottomRightRadius: width * 0.5, 
    alignItems: 'center', 
    paddingTop: height * 0.05, 
    justifyContent: 'flex-start', 
  }, 
  headerRow: { 
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%', 
    paddingHorizontal: width * 0.05, 
    marginBottom: height * 0.03, 
    justifyContent: 'flex-start', 
  },
  backButton: { 
    padding: 10, 
    backgroundColor: '#ffffff44', 
    borderRadius: 10, 
    zIndex: 1, 
  }, 
  headerTitleAligned: { 
    fontSize: width * 0.08, 
    fontWeight: 'bold', 
    color: '#fff', 
    marginLeft: width * 0.05, 
    textAlign: 'center', 
    flex: 1, 
    marginRight: width * 0.15, 
  },
  profileContent: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    flex: 1, 
  }, 

  profileImageContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative', 
    marginBottom: height * 0.02, 
  }, 
  mainImage: { 
    width: width * 0.6, 
    height: width * 0.6, 
    resizeMode: 'cover', 
    borderWidth: 4, 
    borderColor: '#4B0082', 
    borderRadius: width * 0.1, 
  }, 
  overlayIconContainer: { 
    position: 'absolute', 
    right: width * 0.02, 
    bottom: height * 0.005, 
    backgroundColor: '#fff', 
    borderRadius: 25, 
    padding: 5, 
    borderWidth: 2, 
    borderColor: '#4B0082', 
  }, 
  overlayIcon: { 
    width: width * 0.13, 
    height: width * 0.13, 
    resizeMode: 'contain', 
  }, 
  scoreTitleBadge: { 
    marginTop: height * 0.02, 
    fontSize: width * 0.05, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    paddingVertical: height * 0.01, 
    paddingHorizontal: width * 0.04, 
    borderRadius: 20, 
    overflow: 'hidden', 
    marginBottom: height * 0.02, 
  }, 
  bottomContainer: { 
    height: height * 0.4, 
    justifyContent: 'flex-start', 
    alignItems: 'center', 
    backgroundColor: '#f2f2f2', 
    paddingBottom: height * 0.02, 
    paddingTop: height * 0.02, 
  }, 
  userNameTop: { 
    fontSize: width * 0.06, 
    fontWeight: 'bold', 
    color: '#fff', 
    textAlign: 'center', 
    marginBottom: height * 0.03, 
  },

  quizButton: { 
    backgroundColor: primaryColor, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: height * 0.02, 
    paddingHorizontal: width * 0.08, 
    borderRadius: 20, 
    marginTop: height * 0.03, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 5, 
    marginBottom: height * 0.08, 
  }, 
  quizButtonText: { 
    color: '#fff', 
    fontSize: width * 0.045, 
    fontWeight: '600', 
    marginLeft: 10, 
  }, 
  settingsButtonFloating: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: primaryColor,
    borderRadius: 30,
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
