// Example handlers
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
  
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  
    const data = await res.json();
    alert(data.message || "Login attempt made!");
  });
  
  document.getElementById("signupForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    const location = e.target[3].value;
  
    const res = await fetch("http://localhost:5000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, location }),
    });
  
    const data = await res.json();
    alert(data.message || "Signup complete!");
  });
  