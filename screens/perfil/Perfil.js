import React, { useState, useEffect } from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api'; // Importe a instância do axios configurada

// Importe suas imagens de árvore
import arvore0 from '../../assets/IconsLevel/arvore0.png';
import arvore1 from '../../assets/IconsLevel/arvore1.png';
import arvore2 from '../../assets/IconsLevel/arvore2.png';
import arvore3 from '../../assets/IconsLevel/arvore3.png';
import arvore4 from '../../assets/IconsLevel/arvore4.png';

export default function Perfil() {
  const navigation = useNavigation();
  const [userImage, setUserImage] = useState(require('../../assets/iconsLogin/carinhabranco.jpg'));
  const [quizScore, setQuizScore] = useState(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);

  // Mapeamento dos ícones baseados na pontuação
  const treeIcons = [
    arvore0,   // 0 acertos
    arvore1,   // 1 acerto
    arvore2,   // 2 acertos
    arvore3,   // 3 acertos
    arvore4,   // 4 acertos
    arvore4    // 5 acertos
  ];

  // Função para buscar os dados do usuário da API
  const fetchUserData = async () => {
    try {
      setLoading(true);
      
      // Tenta buscar do AsyncStorage
      const score = await AsyncStorage.getItem('@quizScore');
      if (score !== null) {
        setQuizScore(parseInt(score));
      }

      // Tenta buscar do AsyncStorage
      const storedData = await AsyncStorage.getItem('userData');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setUserName(parsedData.nome || '');
      }
      
      // Busca da API para garantir dados atualizados
      const response = await api.get('/api/usuario');
      if (response.data && response.data.nome) {
        setUserName(response.data.nome);
        // Atualiza também no AsyncStorage
        await AsyncStorage.setItem('userData', JSON.stringify({
          nome: response.data.nome
        }));
      }
      
      // Busca a pontuação do quiz
      
      
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do perfil');
    } finally {
      setLoading(false);
    }
  };

  // Função para selecionar imagem da galeria
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
        setUserImage({ uri: result.assets[0].uri });
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  useEffect(() => {
    // Busca os dados quando a tela é focada
    const unsubscribe = navigation.addListener('focus', () => {
      fetchUserData();
    });

    // Busca os dados inicialmente
    fetchUserData();

    return unsubscribe;
  }, [navigation]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.topCurve}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={'#fff'} />
        </TouchableOpacity>

        <View style={styles.container}>
          <Text style={styles.title}>Perfil</Text>
          <TouchableOpacity onPress={pickImage}>
            <View style={styles.profileContainer}>
              <Image
                source={userImage}
                style={styles.mainImage}
              />
              <View style={styles.overlayIconContainer}>
                <Image
                  source={treeIcons[Math.min(quizScore, 5)]}
                  style={styles.overlayIcon}
                />
              </View>
            </View>
          </TouchableOpacity>

          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('Modificacoes')}
        >
          <Text style={styles.editButtonText}>Modificações</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  topCurve: {
    backgroundColor: '#473da1',
    height: '70%',
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    alignItems: 'center',
    paddingTop: 60,
  },

  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
  },

  profileContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  mainImage: {
    width: 250,
    height: 250,
    resizeMode: 'cover',
    borderWidth: 4,
    borderColor: '#4B0082',
    borderRadius: 20,
  },

  overlayIconContainer: {
    position: 'absolute',
    right: 15,
    bottom: 6,
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 5,
    borderWidth: 2,
    borderColor: '#4B0082',
  },

  overlayIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },

  userName: {
    marginTop: 30,
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },

  bottomContainer: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
  },

  editButton: {
    backgroundColor: '#473da1',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },

  editButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },

  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
    alignSelf: 'center',
    marginBottom: 30,
  },

});