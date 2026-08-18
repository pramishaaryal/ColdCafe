const API_URL = "http://localhost:5000/api/contacts";


const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");


contactForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("name")
                .value
                .trim();


        const email =
            document.getElementById("email")
                .value
                .trim();


        const phone =
            document.getElementById("phone")
                .value
                .trim();


        const message =
            document.getElementById("message")
                .value
                .trim();


        if (
            !name ||
            !email ||
            !phone ||
            !message
        ) {

            formMessage.textContent =
                "All fields are required!";

            formMessage.style.color = "red";

            formMessage.classList.add("show");

            return;
        }


        try {

            const response =
                await fetch(
                    API_URL,
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


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to send message."
                );

            }


            formMessage.textContent =
                data.message ||
                "Message sent successfully!";

            formMessage.style.color =
                "green";

            formMessage.classList.add(
                "show"
            );


            contactForm.reset();


            setTimeout(() => {

                formMessage.classList.remove(
                    "show"
                );

                formMessage.style.color =
                    "";

            }, 5000);


        } catch (error) {

            console.error(
                "Contact form error:",
                error
            );


            formMessage.textContent =
                error.message ||
                "Failed to send message. Please try again.";


            formMessage.style.color =
                "red";


            formMessage.classList.add(
                "show"
            );

        }

    }
);