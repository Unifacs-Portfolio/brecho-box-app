import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';

export default function RegistroScreen({ navigation }) {

    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [senha, setSenha] = useState('');
    const [confirmarVisivel, setConfirmarVisivel] = useState(false);

    const senhasIguais = senha === confirmarSenha || confirmarSenha === '';

    return (
        <View style={styles.container}>
            <View style={styles.fundoCurvado}>
                <Image
                    source={require('../assets/icon.jpg')}
                    style={styles.logo}
                    resizeMode="contain"
                />

                <Text style={styles.title}>
                    Crie sua conta!
                </Text>
            </View>
            <View style={styles.card}>
                <TextInput style={styles.input} placeholder='Nome' placeholderTextColor="#473da1" />




                <TextInput placeholder='E-mail'
                    placeholderTextColor="#473da1"
                    style={styles.input}
                    keyboardType='email-address' />


                <View style={styles.inputComIcone}>
                    <TextInput style={styles.inputInterno}
                        placeholder='Senha'
                        placeholderTextColor="#473da1"
                        secureTextEntry={!senhaVisivel}
                        value={senha}
                        onChangeText={setSenha} />

                    <TouchableOpacity onPress={() => setSenhaVisivel(!senhaVisivel)}>
                        <Icon
                            name={senhaVisivel ? 'eye' : 'eye-off'}
                            size={22}
                            color='#473da1'
                        />
                    </TouchableOpacity>
                </View>
                <View style={styles.inputComIcone}>
                    <TextInput style={styles.inputInterno}
                        placeholder='Confirmar senha'
                        placeholderTextColor="#473da1"
                        secureTextEntry={!confirmarVisivel}
                        value={confirmarSenha}
                        onChangeText={setConfirmarSenha} />


                    <TouchableOpacity onPress={() => setConfirmarVisivel(!confirmarVisivel)}>
                        <Icon
                            name={confirmarVisivel ? 'eye' : 'eye-off'}
                            size={22}
                            color='#473da1'
                        />

                    </TouchableOpacity>
                </View>
                {!senhasIguais && (
                    <Text style={styles.erroTexto}>As senhas não coincidem</Text>)}

                <View style={styles.espacoRegistro}>
                    {/* Fazer com que seja enviado as informações para o banco de dados */}
                    <TouchableOpacity style={styles.botaoRegistrar} onPress={() => navigation.navigate('/')}>
                        <Text style={styles.textoBotao}>
                            Registrar
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.loginContainer}>
                        <Text style={styles.textoConta}>Já tem uma conta? </Text>
                        {/* colocar a localização da tela de login aqui! */}
                        <TouchableOpacity onPress={() => navigation.navigate('/')}>
                            <Text style={styles.linkEntrar}>Entrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
            <TouchableOpacity style={styles.botao} onPress={() => navigation.goBack()}>
                <Icon name="arrow-left" size={20} color="#473da1" />
            </TouchableOpacity>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        paddingTop: 100,
    },
    fundoCurvado: {
        backgroundColor: '#473da1',
        height: '50%',
        width: '140%',
        borderBottomLeftRadius: 472,
        borderBottomRightRadius: 470,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        top: 0,


    },
    logo: {
        width: 200,
        height: 200,
        marginBottom: 5,
        marginLeft: 128,
        marginRight: 123,
    },

    title: {
        color: '#ffffff',
        fontSize: 30,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 10,
        marginLeft: 128,
        marginRight: 123,
    },

    card: {
        width: '100%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'stretch',
        marginTop: 170
    },

    input: {
        borderBottomWidth: 1,
        borderBottomColor: '#473da1',
        marginBottom: 16,
        paddingVertical: 8,
    },
    botao: {
        backgroundColor: '#fff',
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 40,
        right: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    espacoRegistro: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoRegistrar: {
        backgroundColor: '#473da1',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 12,
        marginTop: 20,
    },
    textoBotao: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    linkEntrar: {
        color: '#473da1',
        fontWeight: 'bold',
        fontSize: 14,
    },
    loginContainer: {
        flexDirection: 'row',
        marginTop: 16,
        justifyContent: 'center',
    },

    erroTexto: {
        color: 'red',
        marginTop: 8,
    },

    inputComIcone: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        paddingVertical: 8,
    },
    inputInterno: {
        flex: 1,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#473da1',
    }
})
