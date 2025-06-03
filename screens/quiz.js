import React, { useState, useEffect } from 'react';
import {
    View, Text, TouchableOpacity,
    StyleSheet
} from 'react-native';
import { Image } from 'react-native';
import logo from '../assets/brecho-box-quiz.png';
import { Ionicons } from '@expo/vector-icons';


import { quizData } from '../utils/quizdata';


const Quiz = ({navigation}) => {
    const [currentQuestion, setCurrentQuestion] =
        useState(0);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] =
        useState(false);
    const [timeLeft, setTimeLeft] = useState(30);
    const [quizStarted, setQuizStarted] = useState(false);

    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (timeLeft > 0) {
                setTimeLeft(timeLeft - 1);
            } else {
                if (currentQuestion <
                    quizData.length - 1) {
                    setCurrentQuestion(currentQuestion + 1);
                    setTimeLeft(10);
                } else {
                    setQuizCompleted(true);
                }
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [currentQuestion, timeLeft]);

    const handleAnswer = (selectedOption) => {
        if (selectedOption ===
            quizData[currentQuestion].correctAnswer) {
            setScore(score + 1);
        }

        if (currentQuestion <
            quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setTimeLeft(30);
        } else {
            setQuizCompleted(true);
        }
    };

    const handleRetest = () => {
        setCurrentQuestion(0);
        setScore(0);
        setQuizCompleted(false);
        setTimeLeft(30);
    };
    // Display questions and answers when the quiz is completed
    const displayAnswers = quizData.map((question, index) => (
        <View key={index}>
        <Text style={styles.question}>
            {`Question ${index + 1}: ${question.question}`}
        </Text>
        <Text style={styles.correctAnswer}>
            {`Correct Answer: ${question.correctAnswer}`}
        </Text>
        </View>
      ));
      

    return (
        <View style={styles.container}>
            <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('Home')}
        >
        <Ionicons name="arrow-back" size={24} color={primaryColor} />
        <Text style={styles.backButtonText}>Voltar</Text>
        </TouchableOpacity>
            <Image source={logo} style={styles.logo} />
        
            {quizCompleted ? (
                <View>
                    <Text style={styles.score}>
                        Your Score: {score}
                    </Text>
                    <Text style={styles.question}>
                        Questions and Answers:
                    </Text>
                    {displayAnswers}
                    <TouchableOpacity
                        style={styles.retestButton}
                        onPress={handleRetest}>
                        <Text style={styles.buttonText}>
                            Retest
                        </Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <Text style={styles.question}>
                        {quizData[currentQuestion].question}
                    </Text>
                    <Text style={styles.timer}>
                        Time Left: {timeLeft} sec
                    </Text>
                    {quizData[currentQuestion]
                        .options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.option}
                                onPress={() => handleAnswer(option)}
                            >
                                <Text style={styles.buttonText}>
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        ))}
                </View>
            )}
            
            
            
        </View>
        
    );
    
};

const primaryColor = '#464193';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: '40',
        alignItems: 'center',
        justifyContent: 'center',
    },
    question: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#464193',
    },
    option: {
        width: '100%',
        borderColor: '#464193',
        borderRadius: 5,
        backgroundColor: '#464193',
        padding: 10,
        marginBottom: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logo: {
        width: 300,
        resizeMode: 'contain',
        marginBottom: 50,
        alignSelf: 'center',
    },
    score: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#464193',
    },
    retestButton: {
        borderWidth: 1,
        borderColor: '#464193',
        borderRadius: 5,
        backgroundColor: '#464193',
        marginTop: 10,
        padding: 10,
        alignItems: 'center',
    },
    timer: {
        fontSize: 15,
        color: '#767676',
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 20,
        flexDirection: 'row',
    },
    correctAnswer: {
        color: '#767676',
        marginBottom: 10,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        marginLeft: 8,
        color: '#464193',
    },
});
export default Quiz;