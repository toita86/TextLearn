document.addEventListener("DOMContentLoaded", async () => {
  try {
    if (document.getElementById("marketplace-title") !== null) {
      const response = await fetch("/marketplace-courses");
      const data = await response.json();

      const cardbox = document.getElementById("cardbox");

      data.courses.forEach((course) => {
        const card = document.createElement("div");
        card.className = "cards";

        const img = document.createElement("img");
        img.src = course.thumbnail_path;
        img.alt = "lesson image";
        img.id = "card-img";

        const p = document.createElement("p");
        p.textContent = course.title;
        p.className = "card-title";

        const div_button = document.createElement("div");
        div_button.className = "button-container";

        const button_desc = document.createElement("button");
        button_desc.textContent = "Description";
        button_desc.className = "subscribe-btn";
        button_desc.onclick = "openDescription()";

        const button_subscribe = document.createElement("button");
        button_subscribe.id = `card-${course.id}`;
        button_subscribe.textContent = "Join";
        button_subscribe.className = "subscribe-btn";
        button_subscribe.addEventListener("click", async () => {
          if (confirm("Are you sure you want to subscribe this course?")) {
            try {
              const subscribeResponse = await fetch(`/subscribe/${course.id}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
              });
              const subscribeResult = await subscribeResponse.json();
              if (subscribeResult.ok) {
                alert(subscribeResult.message);
              } else {
                alert(subscribeResult.message);
              }
            } catch (error) {
              console.error("Error subscribing to the course:", error);
              alert("An error occurred while subscribing to the course.");
            }
          }
        });

        div_button.appendChild(button_desc);
        div_button.appendChild(button_subscribe);

        card.appendChild(img);
        card.appendChild(p);
        card.appendChild(div_button);

        cardbox.append(card);
      });

      document
        .getElementById("finder")
        .addEventListener("input", async function () {
          const query = this.value;

          const response = await fetch("/marketplace-search", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ query: query }),
          });

          const courses = await response.json();

          // Update the UI with the search results
          updateCourseCards(courses);
        });
    }
  } catch (error) {
    console.error("Error fetching courses:", error);
  }
});

function updateCourseCards(courses) {
  const cardbox = document.getElementById("cardbox");
  cardbox.innerHTML = ""; // Clear previous results
  courses.forEach((course) => {
    const card = document.createElement("div");
    card.className = "cards";

    const img = document.createElement("img");
    img.src = course.thumbnail_path;
    img.alt = "lesson image";
    img.id = "card-img";

    const p = document.createElement("p");
    p.textContent = course.title;
    p.className = "card-title";

    const div_button = document.createElement("div");
    div_button.className = "button-container";

    const button_desc = document.createElement("button");
    button_desc.textContent = "Description";
    button_desc.className = "subscribe-btn";
    button_desc.onclick = "openDescription()";

    const button_subscribe = document.createElement("button");
    button_subscribe.id = `card-${course.id}`;
    button_subscribe.textContent = "Join";
    button_subscribe.className = "subscribe-btn";
    button_subscribe.addEventListener("click", async () => {
      if (confirm("Are you sure you want to subscribe this course?")) {
        try {
          const subscribeResponse = await fetch(`/subscribe/${course.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          const subscribeResult = await subscribeResponse.json();
          if (subscribeResult.ok) {
            alert(subscribeResult.message);
          } else {
            alert(subscribeResult.message);
          }
        } catch (error) {
          console.error("Error subscribing to the course:", error);
          alert("An error occurred while subscribing to the course.");
        }
      }
    });

    div_button.appendChild(button_desc);
    div_button.appendChild(button_subscribe);

    card.appendChild(img);
    card.appendChild(p);
    card.appendChild(div_button);

    cardbox.append(card);
  });
}
