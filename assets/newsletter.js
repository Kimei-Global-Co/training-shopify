document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const contactTags = urlParams.get('contact[tags]');
    const formType = urlParams.get('form_type');

    const emailInput = document.querySelector('input[name="contact[email]"]');
    const fieldWrapper = document.querySelector('.newsletter-form__field-wrapper');
    const errorSpanId = "email-error";

    if (!emailInput || !fieldWrapper) return;

    const messages = {
        required: emailInput.getAttribute('data-required'),
        existed: emailInput.getAttribute('data-error-existed'),
        format: emailInput.getAttribute('data-format')
    };

    // Show error if email is already registered
    if (contactTags === 'newsletter' && formType === 'customer' && emailInput.value.trim()) {
        addError(fieldWrapper, errorSpanId, messages.existed);
        return;
    }

    // Validate before submit
    document.getElementById("Subscribe")?.addEventListener("click", function (event) {
        event.preventDefault();
        validateAndSubmit(emailInput, fieldWrapper, errorSpanId, messages);
    });
});

// Validate data and submit
function validateAndSubmit(emailInput, fieldWrapper, errorSpanId, messages) {
    let emailValue = emailInput.value.trim();
    removeError(errorSpanId, fieldWrapper);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailValue) {
        return addError(fieldWrapper, errorSpanId, messages.required);
    }
    if (!emailRegex.test(emailValue)) {
        return addError(fieldWrapper, errorSpanId, messages.format);
    }

    document.getElementById("ContactFooter")?.submit();
}

// Add error and show it
function addError(fieldWrapper, errorSpanId, errorMessage) {
    removeError(errorSpanId, fieldWrapper);
    fieldWrapper.classList.add("error");

    const errorSpan = document.createElement("span");
    errorSpan.id = errorSpanId;
    errorSpan.textContent = errorMessage;
    fieldWrapper.appendChild(errorSpan);
}

// Remove old errors
function removeError(errorSpanId, fieldWrapper) {
    document.getElementById(errorSpanId)?.remove();
    fieldWrapper.classList.remove("error");
}
