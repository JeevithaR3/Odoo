document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");
  const body = document.body;

  // Theme icon logic
  const updateThemeIcon = () => {
    if (body.classList.contains("dark")) {
      themeIcon.textContent = "☀"; // Sun
      themeIcon.style.color = "white";
    } else {
      themeIcon.textContent = "🌙"; // Moon
      themeIcon.style.color = "#1e293b"; // dark gray-blue
    }
  };

  // Initialize theme from localStorage
  if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
  } else {
    body.classList.remove("dark");
  }
  updateThemeIcon();

  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark");
    localStorage.setItem("theme", body.classList.contains("dark") ? "dark" : "light");
    updateThemeIcon();
  });

  // Profile image upload
  const profileImage = document.getElementById("profile-image");
  const profileImageInput = document.getElementById("profile-image-input");

  profileImage.addEventListener("click", () => {
    profileImageInput.click();
  });

  profileImageInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });

  // Profile form edit/save functionality
  const form = document.getElementById("profile-form");
  const saveBtn = document.getElementById("save-profile");
  const editBtn = document.getElementById("edit-profile");
  const inputs = form.querySelectorAll("input, select, textarea");

  function setFormEditable(editable) {
    inputs.forEach((input) => {
      if (editable) {
        input.removeAttribute("readonly");
        input.removeAttribute("disabled");
      } else {
        if (input.tagName.toLowerCase() === "select") {
          input.disabled = true;
        } else {
          input.readOnly = true;
        }
      }
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    // Optional: Save logic can be added here
    alert("Profile saved successfully!");

    setFormEditable(false);
    saveBtn.classList.add("hidden");
    editBtn.classList.remove("hidden");
  });

  editBtn.addEventListener("click", () => {
    setFormEditable(true);
    saveBtn.classList.remove("hidden");
    editBtn.classList.add("hidden");
  });

  // Initially not editable
  setFormEditable(false);
  saveBtn.classList.add("hidden");
  editBtn.classList.remove("hidden");
});
