  const getData = (url, setData, setLoading) => {
    fetch(url)
      .then(resp => resp.json())
      .then((json) => setData(json))
      .catch((error)=> console.error(error))
      .finally(() => setLoading(false))
  }

  const postData = (url, setData, setLoading) => {
    fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: 55,
        id: 101,
        title: "Post title",
        body: "Post body",
      }),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
      })
      .done();
  }

  const putData = (url, setData, setLoading) =>{
    fetch(url, {
      method: "PUT",
      body: JSON.stringify({
        userId: 55,
        id: 101,
        title: "New Post title",
        body: "New Post body",
      }),
      })
      .then((response) => response.json())
      .then((responseData) => {
        console.log(JSON.stringify(responseData));
      })
      .done();
  }

  const deleteData = (url, setData, setLoading) => {
    fetch(url, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
    .then((response) => response.json())
    .then((responseData) => {
      console.log(JSON.stringify(responseData));
    })
    .done();
  }

  module.exports = { 
                     getData,
                     postData,
                     putData,
                     deleteData
                   }
                   

