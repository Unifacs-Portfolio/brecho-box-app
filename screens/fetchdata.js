import React,{useState, useEffect} from 'react';
import { Text, View, StyleSheet } from 'react-native';
import * as fet from '../utils/fetchdata';

export default function TesteApi() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const url = "https://jsonplaceholder.typicode.com/posts"

  useEffect(() => {
    fet.getData(url, setData, setLoading)
  }, [])


  return (
    <View style={styles.container}>
      {
        loading ? (<Text>Loading...</Text>) : (
          data.map((post) => {
            return (
              <View>
                <Text style={styles.title}>{post.title}</Text>
                <Text>{post.body}</Text>
            </View>
            )
          })
        )
      }      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold'
  },
});


