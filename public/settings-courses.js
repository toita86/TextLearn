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