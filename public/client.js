document.getElementById('btn-signup').addEventListener('click', () => {
    fetch('/upload')
      .then(response => response.json())
      .then(data => {
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
      })
      .catch(error => console.error('Error fetching data:', error));
  });

  document.getElementById('sendData').addEventListener('click', () => {
    const dataToSend = {
      name: 'Client',
      action: 'sendData',
      timestamp: new Date()
    };

    fetch('/api/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
      .then(response => response.json())
      .then(data => {
        document.getElementById('output').textContent = JSON.stringify(data, null, 2);
      })
      .catch(error => console.error('Error sending data:', error));
  });