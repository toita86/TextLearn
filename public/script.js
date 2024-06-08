// Fetch session data from the server
document.addEventListener("DOMContentLoaded", async () => {
  fetch("/session-data")
    .then((response) => response.json())
    .then((data) => {
      const updateNavLinks = (selector) => {
        const entry = document.getElementById(selector);
        try {
          if (data.isAuth) {
            entry.href = "/settings";
            entry.textContent = "User";

            if (document.getElementById("msgToUser")) {
              document.getElementById("msgToUser").textContent = data.msgToUser;
            }
            if (
              document.URL.includes("settings") ||
              document.URL.includes("upload")
            ) {
              document.getElementById("username").textContent = data.username;
              if (data.bio) {
                document.getElementById("bio").textContent = data.bio;
              }
            }
          } else {
            entry.href = "/signup";
            entry.textContent = "Signup";

            const loginEntry = document.createElement("a");
            loginEntry.id = "log-entry";
            loginEntry.href = "/login";
            loginEntry.textContent = "Login";
            entry.parentElement.appendChild(loginEntry);
            if (data.msgToUser) {
              document.getElementById("msgToUser").textContent = data.msgToUser;
            }
          }
        } catch (err) {
          console.log(err);
        }
      };

      updateNavLinks("1-entry");
      updateNavLinks("1-entry-mini");
    });
});
