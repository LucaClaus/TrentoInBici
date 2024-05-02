function ricercaRastrelliereDispositivo(){



    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const { latitude, longitude } = position.coords;
      
          fetch('/api/v1/position', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ position: { latitude, longitude } }),
          })
          .then(response => response.json())
          .then(data => console.log(data.message))
          .catch((error) => {
            console.error('Error:', error);
          });
        });
      } else {

        console.log("Geolocation is not supported by this browser.");
      }
}