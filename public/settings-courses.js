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

    const responseProPic = await fetch("/pro-pic");
    const dataProPic = await responseProPic.json();
    if (dataProPic != null) {
      document.getElementById("usr-image").src = dataProPic.imageUrl;
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

    const imgPopup = document.getElementById("img-popup");
    const img = document.getElementById("usr-image");

    // Verifica che gli elementi esistano nel DOM
    if (imgPopup && img) {
      img.addEventListener("mouseover", () => {
        imgPopup.style.visibility = "visible";
      });

      img.addEventListener("mouseout", () => {
        imgPopup.style.visibility = "hidden";
      });
    } else {
      console.error("Elementi img-popup o usr-image non trovati nel DOM.");
    }
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

  const buttonsDiv = document.createElement("div");
  buttonsDiv.id = "course-btns";

  let delbutton;
  let updateButton;
  let fileInput;

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
    delbutton = unSubButton;
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

    updateButton = document.createElement("button");
    updateButton.className = "courses-buttons";
    updateButton.textContent = "Upload";

    fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".md";
    fileInput.style.display = "none";

    updateButton.addEventListener("click", () => {
      fileInput.click();
    });

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files[0];
      if (file && confirm("Are you sure you want to update this course?")) {
        try {
          const formData = new FormData();
          formData.append("course_upd", file);

          const updateResponse = await fetch(`/update-course/${course.id}`, {
            method: "POST",
            body: formData,
          });

          const updateResult = await updateResponse.json();
          if (updateResult.ok) {
            alert("Course updated successfully!" + updateResult.message);
          } else {
            alert(updateResult.message);
          }
        } catch (error) {
          console.error("Error updating course:", error);
          alert("An error occurred while updating the course.");
        }
      }
    });
    delbutton = deleteButton;
    buttonsDiv.appendChild(fileInput);
    buttonsDiv.appendChild(updateButton);
  }
  courseDiv.appendChild(courseTitle);
  buttonsDiv.appendChild(delbutton);
  courseDiv.appendChild(buttonsDiv);

  coursesContainer.appendChild(hr);
  coursesContainer.appendChild(courseDiv);
}
