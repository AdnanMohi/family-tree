import { showToast } from '../components/toast.js';

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("register-form").addEventListener("submit", function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value.trim();

      if (!name || !email || !password) return alert("All fields are required.");
      if (!email.includes("@")) return alert("Invalid email.");

      fetch("api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "success") {
            showToast("✅ Registered successfully!", "success");
            window.location.href = "/dashboard";
          } else {
            showToast(data.error || "Registration failed", "error");
            console.error("Registration error:", data.error);

            setTimeout(() => {
              window.location.href = "/register";
            }, 1000);
          }
        })
        .catch(err => {
          console.error("Error:", err);
          showToast("Something went wrong, please try again.", "error");
        });
    });

});
