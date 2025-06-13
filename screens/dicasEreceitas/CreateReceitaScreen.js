import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import api from '../../src/services/api';

const { width, height } = Dimensions.get('window');
const primaryColor = '#464193';

export default function CreateReceitaScreen({ navigation }) {
  const [titulo, setTitulo] = useState('');
  const [conteudo, setConteudo] = useState('');
  const [tema, setTema] = useState('');
  const [subtemas, setSubtemas] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [userToken, setUserToken] = useState(null);

  useEffect(() => {
    const fetchUserId = async () => {
      try {
        const userEmail = await AsyncStorage.getItem('@currentUserEmail');
        const token = await AsyncStorage.getItem('userToken');
        setUserToken(token);

        if (!userEmail || !token) {
          Alert.alert('Erro', 'Você precisa estar logado para criar uma receita.');
          navigation.navigate('Login');
          return;
        }

        const response = await api.get(`/api/usuario/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
    

        // CORREÇÃO AQUI: Acessa user.id conforme o log da API
        const userId = response.data?.user?.id;
        
        if (userId) {
          setCurrentUserId(userId);
          console.log('ID do usuário obtido:', userId);
        } else {
          console.error('ID do usuário não encontrado na resposta da API (CreateReceitaScreen):', response.data);
          Alert.alert('Erro', 'Não foi possível obter o ID do usuário. Verifique sua conexão ou a estrutura da API. Tente novamente.');
          navigation.goBack();
        }
      } catch (error) {
        console.error('Erro ao buscar ID do usuário em CreateReceitaScreen:', error.response?.data || error.message);
        Alert.alert('Erro', 'Não foi possível carregar os dados do usuário. Tente novamente.');
        navigation.goBack();
      }
    };
    fetchUserId();
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos da permissão para acessar suas fotos!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: false,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.slice(0, 8 - selectedImages.length).map(asset => ({ uri: asset.uri, type: asset.mimeType, name: asset.fileName || `image_${Date.now()}.jpg` }));
      setSelectedImages(prev => [...prev, ...newImages]);
    }
  };

  const handleRemoveImage = (uriToRemove) => {
    setSelectedImages(prev => prev.filter(image => image.uri !== uriToRemove));
  };

  const handleSubmitReceita = async () => {
    if (!currentUserId) {
      Alert.alert('Erro', 'ID do usuário não disponível. Tente recarregar a tela.');
      return;
    }

    if (!titulo || !conteudo || !tema || subtemas.length === 0) {
      Alert.alert('Erro', 'Por favor, preencha Título, Conteúdo, Tema e pelo menos um Subtema.');
      return;
    }

    if (selectedImages.length === 0) {
      Alert.alert('Erro', 'Por favor, selecione pelo menos uma imagem ou link de vídeo.');
      return;
    }
    
    const youtubeLinks = selectedImages.filter(img => img.uri.includes('youtube.com') || img.uri.includes('youtu.be'));
    const invalidYoutubeLinks = youtubeLinks.filter(link => !isValidYouTubeUrl(link.uri));

    if (invalidYoutubeLinks.length > 0) {
      Alert.alert('Erro', 'Um ou mais links do YouTube são inválidos. Por favor, corrija.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('titulo', titulo);
      formData.append('conteudo', conteudo);
      formData.append('idUsuario', currentUserId);
      formData.append('tema', tema);
      subtemas.forEach(sub => formData.append('subtema[]', sub));

      await Promise.all(selectedImages.map(async (image, index) => {
        if (image.uri.includes('youtube.com') || image.uri.includes('youtu.be')) {
          formData.append('files', image.uri);
        } else {

          const response = await fetch(image.uri);
          const blob = await response.blob();
          

          const fileName = image.name || `photo_${Date.now()}_${index}.jpg`;
          const fileType = image.type || 'image/jpeg'; // Fallback para tipo

          formData.append('files', blob, fileName);
        }
      }));

      const response = await api.post('/api/receitas', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Receita criada com sucesso!');
        navigation.goBack();
      } else {
        Alert.alert('Erro', response.data?.message || 'Erro ao criar receita.');
      }
    } catch (error) {
      console.error('Erro ao criar receita:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível criar a receita. Verifique o console para mais detalhes.');
    } finally {
      setLoading(false);
    }
  };

  const isValidYouTubeUrl = (url) => {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|)([\w-]{11})(?:\S+)?/i;
    return regExp.test(url);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={primaryColor} />
        </TouchableOpacity>

        <Text style={styles.header}>Criar Nova Receita</Text>

        <View style={styles.formCard}>
          <TextInput
            style={styles.input}
            placeholder="Título da Receita"
            placeholderTextColor="#aaa"
            value={titulo}
            onChangeText={setTitulo}
            editable={!loading}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Conteúdo da Receita"
            placeholderTextColor="#aaa"
            value={conteudo}
            onChangeText={setConteudo}
            multiline
            numberOfLines={5}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Tema (ex: Moda, Gastro)"
            placeholderTextColor="#aaa"
            value={tema}
            onChangeText={setTema}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Subtemas (separados por vírgula)"
            placeholderTextColor="#aaa"
            value={subtemas.join(', ')}
            onChangeText={text => setSubtemas(text.split(',').map(s => s.trim()).filter(s => s))}
            editable={!loading}
          />

          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} disabled={loading || selectedImages.length >= 8}>
            <Ionicons name="image-outline" size={24} color="#fff" />
            <Text style={styles.imagePickerButtonText}>
              Selecionar Imagem/Vídeo ({selectedImages.length}/8)
            </Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ou cole um link do YouTube (até 8)"
            placeholderTextColor="#aaa"
            onChangeText={(text) => {
              if (text.includes('youtube.com') || text.includes('youtu.be')) {
                if (selectedImages.length < 8) {
                    setSelectedImages(prev => {
                        if (prev.some(img => img.uri === text) || !isValidYouTubeUrl(text)) {
                            return prev;
                        }
                        return [...prev, { uri: text, type: 'video/youtube', name: 'youtube_video.mp4' }];
                    });
                    Alert.alert('Link Adicionado', 'Link do YouTube adicionado. Ele será usado para a miniatura.');
                } else {
                    Alert.alert('Limite Atingido', 'Máximo de 8 imagens/vídeos selecionados.');
                }
              }
            }}
            value={selectedImages.filter(img => img.uri.includes('youtube.com') || img.uri.includes('youtu.be')).map(img => img.uri).join('\n')}
            onBlur={() => { /* Limpar campo após adicionar */ }}
            multiline
            numberOfLines={2}
          />

          <View style={styles.imagePreviewContainer}>
            {selectedImages.map((image, index) => (
              <View key={image.uri} style={styles.imagePreviewWrapper}>
                <Image
                  source={{ uri: image.uri.includes('youtube.com') || image.uri.includes('youtu.be') ? getYouTubeThumbnail(image.uri) : image.uri }}
                  style={styles.imagePreview}
                  resizeMode="cover"
                />
                <TouchableOpacity onPress={() => handleRemoveImage(image.uri)} style={styles.removeImageButton}>
                  <Ionicons name="close-circle" size={24} color="red" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.disabledButton]}
            onPress={handleSubmitReceita}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Publicar Receita</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: width * 0.05,
    paddingTop: height * 0.08,
  },
  backButton: {
    position: 'absolute',
    top: height * 0.05,
    left: width * 0.05,
    padding: 10,
    zIndex: 1,
  },
  header: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
    color: primaryColor,
    marginBottom: height * 0.03,
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.05,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: '100%',
    padding: height * 0.015,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: height * 0.02,
    fontSize: width * 0.04,
  },
  textArea: {
    height: height * 0.15,
    textAlignVertical: 'top',
  },
  imagePickerButton: {
    backgroundColor: primaryColor,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: height * 0.015,
    borderRadius: 10,
    marginBottom: height * 0.02,
  },
  imagePickerButtonText: {
    color: '#fff',
    fontSize: width * 0.04,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: height * 0.02,
    marginTop: height * 0.01,
  },
  imagePreviewWrapper: {
    position: 'relative',
    marginRight: width * 0.02,
    marginBottom: width * 0.02,
  },
  imagePreview: {
    width: width * 0.25,
    height: width * 0.25,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 15,
  },
  submitButton: {
    backgroundColor: primaryColor,
    paddingVertical: height * 0.02,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: height * 0.01,
  },
  disabledButton: {
    backgroundColor: '#999',
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});
