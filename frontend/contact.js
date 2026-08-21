// =====================================================
// CONTACT API
// =====================================================

const API_URL = import.meta.env.VITE_API_URL;

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");


// =====================================================
// CHECK API CONFIGURATION
// =====================================================

if (!API_URL) {

    console.error(
        "VITE_API_URL is not configured in the .env file."
    );

}


// =====================================================
// CONTACT FORM SUBMIT
// =====================================================

if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // ---------------------------------------------
            // GET FORM VALUES
            // ---------------------------------------------

            const name =
                document
                    .getElementById("name")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const phone =
                document
                    .getElementById("phone")
                    .value
                    .trim();


            const message =
                document
                    .getElementById("message")
                    .value
                    .trim();


            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (
                !name ||
                !email ||
                !phone ||
                !message
            ) {

                showFormMessage(
                    "All fields are required!",
                    "error"
                );

                return;

            }


            // ---------------------------------------------
            // EMAIL VALIDATION
            // ---------------------------------------------

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                showFormMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;

            }


            // ---------------------------------------------
            // API CONFIG CHECK
            // ---------------------------------------------

            if (!API_URL) {

                showFormMessage(
                    "Server configuration is missing. Please try again later.",
                    "error"
                );

                return;

            }


            // ---------------------------------------------
            // LOADING STATE
            // ---------------------------------------------

            const submitButton =
                contactForm.querySelector(
                    'button[type="submit"]'
                );


            const originalButtonText =
                submitButton
                    ? submitButton.textContent
                    : "";


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Sending...";

            }


            // ---------------------------------------------
            // SEND DATA TO BACKEND
            // ---------------------------------------------

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/contacts`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                email: email,

                                phone: phone,

                                message: message

                            })
                        }
                    );


                // -----------------------------------------
                // READ RESPONSE
                // -----------------------------------------

                let data = {};

                try {

                    data =
                        await response.json();

                } catch (jsonError) {

                    data = {};

                }


                // -----------------------------------------
                // BACKEND ERROR
                // -----------------------------------------

                if (!response.ok) {

                    throw new Error(
                        data.message ||
                        "Failed to send your message."
                    );

                }


                // -----------------------------------------
                // SUCCESS
                // -----------------------------------------

                showFormMessage(
                    data.message ||
                    "Your message has been sent successfully!",
                    "success"
                );


                // Clear form

                contactForm.reset();


                // -----------------------------------------
                // HIDE SUCCESS MESSAGE
                // -----------------------------------------

                setTimeout(
                    function () {

                        hideFormMessage();

                    },
                    5000
                );


            } catch (error) {

                console.error(
                    "Contact form error:",
                    error
                );


                // -----------------------------------------
                // ERROR MESSAGE
                // -----------------------------------------

                showFormMessage(
                    getErrorMessage(error),
                    "error"
                );


            } finally {

                // -----------------------------------------
                // RESTORE BUTTON
                // -----------------------------------------

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.textContent =
                        originalButtonText;

                }

            }

        }
    );

}


// =====================================================
// SHOW FORM MESSAGE
// =====================================================

function showFormMessage(
    message,
    type
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        message;


    formMessage.classList.add(
        "show"
    );


    if (type === "success") {

        formMessage.style.color =
            "green";

    } else {

        formMessage.style.color =
            "red";

    }

}


// =====================================================
// HIDE FORM MESSAGE
// =====================================================

function hideFormMessage() {

    if (!formMessage) {
        return;
    }


    formMessage.classList.remove(
        "show"
    );


    formMessage.style.color =
        "";

}


// =====================================================
// ERROR MESSAGE
// =====================================================

function getErrorMessage(error) {

    if (
        error instanceof TypeError &&
        error.message === "Failed to fetch"
    ) {

        return (
            "Unable to connect to the server. " +
            "Please check your internet connection and try again."
        );

    }


    return (
        error.message ||
        "Something went wrong. Please try again."
    );

}