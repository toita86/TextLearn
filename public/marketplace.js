document.addEventListener('DOMContentLoaded', async () => {
    try {
      if(document.getElementById('marketplace-title') !== null) {
        const response = await fetch('/marketplace-courses');
        const data = await response.json();
  
        const cardbox = document.getElementById('cardbox');
  
        data.courses.forEach(course => {
          const card = document.createElement('div');
          card.className ='cards';
  
          const img = document.createElement('img');
          img.src = course.thumbnail_path;
          img.alt ='lesson image';
          img.id ='card-img';
  
          const p = document.createElement('p');
          p.textContent = course.title;
          p.className ='card-title';
  
          const div_button = document.createElement('div');
          div_button.className = 'button-container';
  
          const button_desc = document.createElement('button');
          button_desc.textContent ='Description';
          button_desc.className ='subscribe-btn';
          button_desc.onclick = "openDescription()";
  
          button_subscribe = document.createElement('button');
          button_subscribe.textContent ='Subscribe';
          button_subscribe.className ='subscribe-btn';
  
          div_button.appendChild(button_desc);
          div_button.appendChild(button_subscribe);
  
          card.appendChild(img);
          card.appendChild(p);
          card.appendChild(div_button);
  
          cardbox.append(card);
        });
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  });