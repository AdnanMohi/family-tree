document.addEventListener("DOMContentLoaded", () => {
  // Login form handler
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!email || !password) {
        alert("Both fields are required!");
        return;
      }

      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Server response:", data);
          if (data.success) {
            console.log("User logged in successfully");
            window.location.href = "/dashboard"; // Redirect to dashboard
          } else {
            console.error("Error logging in:", data.error);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Something went wrong. Please try again.");
        });
    }
    );
  }

  // Register form handler
    document.getElementById("register-form").addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!name || !email || !password) return alert("All fields are required.");
      if (!email.includes("@")) return alert("Invalid email.");

      fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            alert("Registered successfully!");
            window.location.href = "/dashboard";
          } else {
            alert("Registration failed: " + data.error);
          }
        })
        .catch(err => {
          console.error("Error:", err);
          alert("Server error.");
        });
    });

});
