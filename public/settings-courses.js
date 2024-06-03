document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/user-courses");
    const data = await response.json();
    if (data.isAuth) {
      const coursesContainer = document.getElementById("courses");
      data.courses.forEach((course) => {
        coursesListing(course, coursesContainer);
      });
    }

    const responseSub = await fetch("/user-sub-courses");
    const dataSub = await responseSub.json();
    if (dataSub.isAuth) {
      const coursesContainerSub = document.getElementById("sub-courses");
      dataSub.courses.forEach((course) => {
        coursesListing(course, coursesContainerSub);
      });
    }

    if (document.getElementById("log-out-btn")) {
      logOutButton = document.getElementById("log-out-btn");
      logOutButton.addEventListener("click", async () => {
        if (confirm("Are you sure you want to Log Out?")) {
          const response = await fetch("/logout", {
            method: "POST",
            credentials: "same-origin",
          });

          if (response.ok) {
            window.location = "/login";
          } else {
            console.error("Logout failed");
          }
        }
      });
    }

    document.getElementById("usr-image").addEventListener("click", () => {
      document.getElementById("pro-pic-input").click();
    });

    document.getElementById("pro-pic-input").addEventListener("change", () => {
      const form = document.getElementById("upload-pro-pic");
      const formData = new FormData(form);

      fetch("/update-pro-pic", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          document.getElementById("usr-image").src = data.imageUrl;
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
  }

  if (document.getElementById("remove-account")) {
    removeAccount = document.getElementById("remove-account");
    removeAccount.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete your account?")) {
        const response = await fetch("/remove-account", {
          method: "DELETE",
          credentials: "same-origin",
        });

        if (response.ok) {
          window.location = "/";
        } else {
          console.error("Logout failed");
        }
      }
    });
  }
});

/*"same-origin" means that the request will include cookies and HTTP authentication information only if the URL is on the same origin as the calling script. */

function coursesListing(course, coursesContainer) {
  const hr = document.createElement("hr");
  const courseDiv = document.createElement("div");
  courseDiv.className = "course";
  courseDiv.id = course.id;

  const courseTitle = document.createElement("a");
  courseTitle.className = "course-title";
  courseTitle.textContent = course.title;
  courseTitle.href = `/reader/${course.id}`;

  let button;

  if (coursesContainer.id === "sub-courses") {
    const unSubButton = document.createElement("button");
    unSubButton.className = "courses-buttons";
    unSubButton.textContent = "Unsubscribe";
    unSubButton.addEventListener("click", async () => {
      if (confirm("Are you sure you want to unsubscribe form this course?")) {
        try {
          const unsubResponse = await fetch(`/unsub-course/${course.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const unsubResult = await unsubResponse.json();
          if (unsubResponse.ok) {
            course = coursesContainer.querySelector(`[id="${course.id}"]`);
            course.classList.add("slideLeft");
            setTimeout(() => {
              course.style.display = "none";
            }, 300); // Durata dell'animazione
          } else {
            alert(unsubResult.message);
          }
        } catch (error) {
          console.error("Error unsubscribing the course:", error);
          alert("An error occurred while unsubscribing from the course.");
        }
      }
    });
    button = unSubButton;
  } else {
    const deleteButton = document.createElement("button");
    deleteButton.className = "courses-buttons";
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener("click", async () => {
      if (confirm("Are you sure you want to delete this course?")) {
        try {
          const deleteResponse = await fetch(`/delete-course/${course.id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const deleteResult = await deleteResponse.json();
          if (deleteResponse.ok) {
            course = coursesContainer.querySelector(`[id="${course.id}"]`);
            course.classList.add("slideLeft");
            setTimeout(() => {
              course.style.display = "none";
            }, 300); // Durata dell'animazione
          } else {
            alert(deleteResult.message);
          }
        } catch (error) {
          console.error("Error deleting course:", error);
          alert("An error occurred while deleting the course.");
        }
      }
    });
    button = deleteButton;
  }
  courseDiv.appendChild(courseTitle);
  courseDiv.appendChild(button);

  coursesContainer.appendChild(hr);
  coursesContainer.appendChild(courseDiv);
}
