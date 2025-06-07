import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import logoApp from '../assets/icon.jpg';
import api from '../src/services/api';

export default function RegistroScreen({ navigation }) {
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [telefone, setTelefone] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
        
        try {
            const telefoneFormatado = telefone.replace(/\D/g, '');
            
            const response = await api.post('/api/usuario', {
                nome,
                email,
                senha,
                telefone: telefoneFormatado,
                nivelConsciencia: 1,
                isMonitor: false
            });

            Alert.alert('Sucesso', 'Conta criada com sucesso!');
            navigation.navigate('Login');
        } catch (error) {
            console.error('Erro no registro:', error.response?.data || error.message);
            Alert.alert(
                'Erro', 
                error.response?.data?.errors?.join('\n') || 'Não foi possível registrar'
            );
        } finally {
            setLoading(false);
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
                    {/* Input Nome */}
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

                    {/* Input Email */}
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

                    {/* Input Telefone */}
                    <View style={styles.inputGroup}>
                        <TextInput
                            placeholder="Telefone"
                            placeholderTextColor="#aaa"
                            style={styles.inputField}
                            value={telefone}
                            onChangeText={setTelefone}
                            keyboardType="phone-pad"
                        />
                        <MaterialCommunityIcons name="phone-outline" size={24} color="#464193" style={styles.inputIcon} />
                    </View>

                    {/* Input Senha */}
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

                    {/* Input Confirmar Senha */}
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
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container2: {
        alignItems: 'center',
        justifyContent: 'center',
    },
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
    form: {
        marginTop: 20,
        width: '80%',
    },
    inputGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f2f2f2',
        borderRadius: 12,
        paddingHorizontal: 10,
        marginBottom: 15,
    },
    inputField: {
        flex: 1,
        height: 50,
        fontSize: 16,
        color: '#333',
    },
    inputIcon: {
        marginLeft: 8,
    },
    iconButton: {
        padding: 5,
    },
    loginButton: {
        backgroundColor: primaryColor,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 15,
    },
    disabledButton: {
        backgroundColor: '#999',
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    register: {
        color: '#555',
    },
    registerLink: {
        color: primaryColor,
        fontWeight: 'bold',
    },
    erroTexto: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
});