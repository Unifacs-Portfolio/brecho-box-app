import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import logoApp from '../assets/icon.jpeg';
import api from '../src/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegistroScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    // Função para formatar o telefone no padrão (XX) XXXXX-XXXX
    const formatarTelefone = (valor) => {
        // Remove tudo que não for número
        const numeros = valor.replace(/\D/g, '');

        // Aplica a máscara dependendo do tamanho
        if (numeros.length <= 2) {
            return '(' + numeros;
        } else if (numeros.length <= 7) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
        } else if (numeros.length <= 11) {
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
        } else {
            // Limita a 11 dígitos (padrão brasileiro com DDD e número com 9 dígitos)
            return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
        }
    };


    const handleRegister = async () => {
        if (loading) return;

        if (!nome || !email || !telefone || !senha || !confirmarSenha) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        const validatePassword = (senha) => {
            return senha.length >= 6;
        };

        if (!validatePassword(senha)) {
            Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
            return;
        }

        setLoading(true);

        try {
            const telefoneFormatado = telefone.replace(/\D/g, '');
        
            const response = await api.post('/api/usuario', {
                nome,
                email,
                senha,
                tokens: 'random-token-' + Math.random().toString(36).substring(2),
                telefone: telefoneFormatado,
                nivelConsciencia: "1",
                isMonitor: false
            });
        
            await saveUserData(email, nome);
            
            Alert.alert(
                'Sucesso!',
                'Conta criada com sucesso!',
                [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
            );
        } catch (error) {
            const erroServidor = error.response?.data?.errors?.[0];
            const status = error.response?.status;

            if (status === 409 || erroServidor?.toLowerCase().includes('email')) {
                Alert.alert('Erro', 'Este e-mail já está em uso. Tente outro.');
            } else {
                Alert.alert('Erro no registro', erroServidor || 'Não foi possível concluir o registro.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Função para salvar os dados do usuário
    const saveUserData = async (email, nome) => {
        try {
            await AsyncStorage.setItem(`@userData:${email}`, JSON.stringify({ nome }));
            await AsyncStorage.setItem('@currentUserEmail', email);
            console.log('Dados do usuário salvos:', email);
        } catch (error) {
            console.error('Erro ao salvar dados do usuário:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topCurve}>
                <View style={styles.purpleBackground}></View>
                <Image source={logoApp} style={styles.appLogo} />
                <Text style={styles.title}>Crie sua conta!</Text>
            </View>

            <View style={styles.container2}>
                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="Nome completo"
                            placeholderTextColor="#aaa"
                            style={styles.inputField}
                            value={nome}
                            onChangeText={setNome}
                        />
                        <MaterialCommunityIcons name="account-outline" size={24} color="#464193" style={styles.inputIcon} />
                    </View>

                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="E-mail"
                            placeholderTextColor="#aaa"
                            style={styles.inputField}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <MaterialCommunityIcons name="email-outline" size={24} color="#464193" style={styles.inputIcon} />
                    </View>

                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="Telefone"
                            placeholderTextColor="#aaa"
                            style={styles.inputField}
                            value={telefone}
                            onChangeText={text => setTelefone(formatarTelefone(text))}
                            keyboardType="phone-pad"
                        />
                        <MaterialCommunityIcons name="phone-outline" size={24} color="#464193" style={styles.inputIcon} />
                    </View>

                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="Senha"
                            placeholderTextColor="#aaa"
                            style={styles.inputField}
                            value={senha}
                            onChangeText={setSenha}
                            secureTextEntry={!showPassword}
                        />
                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconButton}>
                            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="#464193" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="Confirmar senha"
                            placeholderTextColor="#aaa"
                            style={styles.inputField}
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            secureTextEntry={!showConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.iconButton}>
                            <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={24} color="#464193" />
                        </TouchableOpacity>
                    </View>

                    {senha !== confirmarSenha && confirmarSenha !== '' && (
                        <Text style={styles.erroTexto}>As senhas não coincidem</Text>
                    )}

                    <TouchableOpacity
                        style={[styles.loginButton, loading && styles.disabledButton]}
                        onPress={handleRegister}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.loginButtonText}>Registrar</Text>
                        )}
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.register}>Já tem uma conta? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}
                        >
                            <Text style={styles.registerLink}>Entrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const primaryColor = '#464193';

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    container2: { alignItems: 'center', justifyContent: 'center' },
    topCurve: {
        backgroundColor: '#473da1',
        height: '50%',
        borderBottomLeftRadius: 200,
        borderBottomRightRadius: 200,
        alignItems: 'center',
        paddingTop: 60,
    },
    purpleBackground: {
        backgroundColor: primaryColor,
        width: '150%',
        height: 200,
        borderBottomLeftRadius: 100,
        borderBottomRightRadius: 100,
        position: 'absolute',
        top: 0,
        zIndex: -1,
    },
    appLogo: {
        width: 200,
        height: 200,
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 20,
    },
    form: { marginTop: 20, width: '80%' },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    inputField: { flex: 1, height: 50, fontSize: 16, color: '#333' },
    inputIcon: { marginLeft: 8 },
    iconButton: { padding: 5 },
    loginButton: {
        backgroundColor: primaryColor,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 10,
    },
    disabledButton: { backgroundColor: '#999' },
    loginButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    erroTexto: { color: 'red', marginBottom: 10, textAlign: 'center' },
    loginContainer: { flexDirection: 'row', justifyContent: 'center' },
    register: { color: '#555' },
    registerLink: { color: primaryColor, fontWeight: 'bold' },
    observacao: {
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
        marginBottom: 15,
        marginTop: -5,
    },
});

