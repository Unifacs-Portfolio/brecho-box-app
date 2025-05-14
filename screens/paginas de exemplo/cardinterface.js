import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';

const CardView = ({ imageSource, title, description, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Image source={{ uri: imageSource }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const Card = () => {
  const handleCardPress = () => {
    console.log('Card pressed!');
  };

  return (
    <View style={styles.container}>

      <CardView
        imageSource="https://img.freepik.com/premium-photo/chibi-characters-two-hearts-with-heart_42136-249.jpg?w=740"
        title="Card Title"
        description="This is the example of React Native Card view. This is the easiest way to adding a card view on your screen."
        onPress={handleCardPress}
      />
      <br/> 
      <CardView
        imageSource="https://img.freepik.com/free-vector/cute-shiba-inu-dog-bite-bone-cartoon-vector-icon-illustration-animal-nature-icon-concept-isolated_138676-7368.jpg?w=740&t=st=1680068165~exp=1680068765~hmac=a996aab00d401e4052c2bff9750de6db67264f0539b8117652deb0c05e52ecfe"
        title="Card Title"
        description="This is the example of React Native Card view. This is the easiest way to adding a card view on your screen."
        onPress={handleCardPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 20,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  cardDescription: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Card;

