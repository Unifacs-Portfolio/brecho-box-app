import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../src/services/api';

export default function AuthChecker({ navigation }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const manterConectado = await AsyncStorage.getItem('@manterConectado');
        const expiration = await AsyncStorage.getItem('@tokenExpiration');
        
        // Se não tem token ou não está marcado para manter conectado, vai para Login
        if (!token || manterConectado !== 'true') {
          navigation.replace('Inicio');
          return;
        }

        // Verifica se o token expirou
        if (expiration && Date.now() > parseInt(expiration)) {
          await AsyncStorage.removeItem('userToken');
          await AsyncStorage.removeItem('@tokenExpiration');
          navigation.replace('Login');
          return;
        }

        // Verifica com a API se o token ainda é válido
        try {
          await api.get('/api/usuario', {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Se chegou aqui, o token é válido
          navigation.replace('Home');
        } catch (error) {
          // Se o status for 401 (não autorizado), remove o token e redireciona
          if (error?.status === 401) {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('@tokenExpiration');
          }
          navigation.replace('Login');
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        navigation.replace('Login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}