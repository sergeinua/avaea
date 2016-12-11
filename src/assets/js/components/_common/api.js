// import fetch from 'fetch';

let ClientApi = {

  reqPost: function (reqUrl, reqData, isDispatchError) {
    return fetch(reqUrl, {
      method: 'POST',
      body: reqData ? JSON.stringify(reqData) : null,
      credentials: 'same-origin' // required for including auth headers
    })
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json;
      })
      .catch(function (error) {
        if (isDispatchError) {
          return Promise.reject(error);
        } else {
          console.error(error);
        }
      });
  }

};

export default ClientApi;
