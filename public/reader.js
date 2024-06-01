document.addEventListener("DOMContentLoaded", () => {
  // Get the current path from the URL (e.g., /reader/1)
  const path = window.location.pathname;

  // Extract the course ID from the path
  const pathParts = path.split("/");
  const courseId = pathParts[pathParts.length - 1];

  // Check if the course ID is valid
  if (!courseId) {
    console.error("Invalid course ID");
    document.getElementById("reader").innerHTML = "<p>Invalid course ID</p>";
    return;
  }

  const courseContainer = document.getElementById("reader");

  // Fetch the HTML content of the course
  fetch(`/course-reader/${courseId}`)
    .then((response) => response.json())
    .then((data) => {
      courseContainer.innerHTML = data.content;
    })
    .catch((error) => {
      console.error("Error fetching course content:", error);
      courseContainer.innerHTML = "<p>Failed to load course content.</p>";
    });
});
