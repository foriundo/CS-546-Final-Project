const passwordInput = document.getElementById("password");
const togglePasswordButton = document.getElementById("toggle-password");

if (passwordInput && togglePasswordButton) {
  togglePasswordButton.addEventListener("click", () => {
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      togglePasswordButton.textContent = "Hide";
    } else {
      passwordInput.type = "password";
      togglePasswordButton.textContent = "Show";
    }
  });
}