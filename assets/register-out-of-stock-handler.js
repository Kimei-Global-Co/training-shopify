    function registerProduct(productId, productName, color, size, variantId) {
        const registerButton = document.querySelector(".RegisterSoldOutProductForm-form__button");
        const emailInput = document.getElementById("register-email");
        const errorMessage = document.querySelector(".error-message");
        const loadingSpinner = registerButton.querySelector(".register_form-soldout .loading__spinner");

        // Validate emails
        const email = emailInput.value.trim();
        if (!validateEmail(email)) {
            errorMessage.textContent = "Please enter a valid email address.";
            errorMessage.style.display = "block";
            return;
        }

        // Spinner loading when processing send email
        registerButton.style.backgroundColor = "#28a745";
        registerButton.style.opacity = "0.7";
        registerButton.style.pointerEvents = "none";
        registerButton.style.transition = "background-color 0.3s ease";
        if (loadingSpinner) {
            loadingSpinner.classList.remove("hidden");
        }

        // Error alert
        errorMessage.style.display = "none";

        fetch(`${config?.server?.baseURL}/api/products/${productId}/notify`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                productName,
                color,
                size,
                variantId
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert("You have successfully registered for this product!");
                emailInput.value = "";
            } else {
                errorMessage.textContent = data.message || "Registration failed. Please try again.";
                errorMessage.style.display = "block";
            }
        })
        .catch(error => {
            console.error("Error registering product:", error);
            errorMessage.textContent = "An error occurred. Please try again later.";
            errorMessage.style.display = "block";
        })
        .finally(() => {
            // Hide the loading effect after completing the request
            registerButton.style.backgroundColor = "";
            registerButton.style.opacity = "1";
            registerButton.style.pointerEvents = "auto";
            if (loadingSpinner) {
                loadingSpinner.classList.add("hidden");
            }
        });
    }

    function validateEmail(email) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(email);
    }




