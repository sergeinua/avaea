
var ClientApi = {

  reqGet: function (reqUrl) {
    return fetch(reqUrl, {
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch(function (error) {
        console.error(error);
      });
  },

  reqPost: function (reqUrl, reqData) {
    return fetch(reqUrl, {
      method: 'POST',
      body: JSON.stringify(reqData),
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch(function (error) {
        console.error(error);
      });
  }

};