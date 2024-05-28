// Fetch session data from the server
fetch("/session-data")
  .then((response) => response.json())
  .then((data) => {
    const updateNavLinks = (selector) => {
      const entry = document.querySelector(selector);
      if (data.isAuth) {
        entry.href = "/settings";
        entry.textContent = "User";

        document.getElementById("username").textContent = data.username;
        if (data.bio) {
          document.getElementById("bio").textContent = data.bio;
        }
        if (data.msgToUser) {
          document.getElementById("msgToUser").textContent = data.msgToUser;
        }
      } else {
        entry.href = "/signup";
        entry.textContent = "Signup";

        const loginEntry = document.createElement("a");
        loginEntry.id = "2-entry";
        loginEntry.href = "/login";
        loginEntry.textContent = "Login";
        entry.parentElement.appendChild(loginEntry);
        if (data.msgToUser) {
          document.getElementById("msgToUser").textContent = data.msgToUser;
        }
      }
    };

    updateNavLinks("#1-entry");
    updateNavLinks("#1-entry-mini");
  });