// Fetch session data from the server
fetch('/session-data')
.then(response => response.json())
.then(data => {
    if (data.isAuth) {
      document.getElementById('1-entry').href = '/settings';
      document.getElementById('1-entry').textContent = 'User';
      
      document.getElementById('username').textContent = data.username;
      document.getElementById('bio').textContent = data.bio;
      if(data.msgToUser){
        document.getElementById('msgToUser').textContent = data.msgToUser;
      }

    } else {
      document.getElementById('1-entry').href = '/signup';
      document.getElementById('1-entry').textContent = 'Signup';

      var entry = document.createElement('a');
      entry.id ='log-entry';
      entry.href = '/login';
      entry.textContent = 'Login';
      document.getElementById('nav-link').append(entry);
      if(data.msgToUser){
        document.getElementById('msgToUser').textContent = data.msgToUser;
      }
    }
});

document.addEventListener('DOMContentLoaded', async () => {
  try {
    if(document.getElementById('courses') !== null){
      const response = await fetch('/user-courses');
      const data = await response.json();
      
      if (data.isAuth) {
          const coursesContainer = document.getElementById('courses');

          data.courses.forEach(course => {
            const hr = document.createElement('hr');
            const courseDiv = document.createElement('div');
            courseDiv.className = 'course';

            const courseTitle = document.createElement('div');
            courseTitle.className = 'course-title';
            courseTitle.textContent = course.title;

            const deleteButton = document.createElement('button');
            deleteButton.className = 'courses-buttons';
            deleteButton.textContent = 'Delete';
            deleteButton.addEventListener('click', async () => {
              if (confirm('Are you sure you want to delete this course?')) {
                try {
                    const deleteResponse = await fetch(`/delete-course/${course.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    const deleteResult = await deleteResponse.json();
                    if (deleteResponse.ok) {
                        alert(deleteResult.message);
                        courseDiv.remove(); // Remove the course element from the DOM
                        hr.remove(); // Remove the associated <hr> element
                    } else {
                        alert(deleteResult.message);
                    }
                } catch (error) {
                    console.error('Error deleting course:', error);
                    alert('An error occurred while deleting the course.');
                }
              }
            });
            courseDiv.appendChild(courseTitle);
            courseDiv.appendChild(deleteButton);

            coursesContainer.appendChild(hr);
            coursesContainer.appendChild(courseDiv);
          });
        }
      }
  } catch (error) {
      console.error('Error fetching courses:', error);
  }
});

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