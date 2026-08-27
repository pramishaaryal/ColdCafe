/* =====================================================
   ABOUT PAGE
   TEAM + REVIEW BACKEND INTEGRATION
====================================================== */


/* =====================================================
   API URL
====================================================== */

const API_URL = import.meta.env.VITE_API_URL;


/* =====================================================
   TEAM CONTAINER
====================================================== */

const teamContainer =
    document.getElementById("teamContainer");


/* =====================================================
   LOAD TEAM
====================================================== */

async function loadTeam() {

    if (!teamContainer) {
        console.error("Team container not found.");
        return;
    }


    /* -------------------------------------------------
       Loading
    ------------------------------------------------- */

    teamContainer.innerHTML = `
        <div class="team-loading">
            <i class="ri-loader-4-line"></i>
            <p>Loading our team...</p>
        </div>
    `;


    try {

        if (!API_URL) {

            throw new Error(
                "VITE_API_URL is not available."
            );

        }


        /* -------------------------------------------------
           Backend Team API
        ------------------------------------------------- */

        const response = await fetch(
            `${API_URL}/api/team`
        );


        if (!response.ok) {

            throw new Error(
                `Team API Error: ${response.status}`
            );

        }


        /* -------------------------------------------------
           Get JSON
        ------------------------------------------------- */

        const data =
            await response.json();


        console.log(
            "Team data:",
            data
        );


        /* -------------------------------------------------
           Get Team Array
        ------------------------------------------------- */

        let teamMembers = [];


        if (Array.isArray(data)) {

            teamMembers = data;

        }

        else if (
            data &&
            Array.isArray(data.data)
        ) {

            teamMembers = data.data;

        }

        else if (
            data &&
            Array.isArray(data.team)
        ) {

            teamMembers = data.team;

        }

        else if (
            data &&
            Array.isArray(data.teamMembers)
        ) {

            teamMembers = data.teamMembers;

        }


        /* -------------------------------------------------
           Empty Team
        ------------------------------------------------- */

        if (teamMembers.length === 0) {

            teamContainer.innerHTML = `
                <div class="team-empty">

                    <i class="ri-team-line"></i>

                    <h3>
                        Our team is coming soon
                    </h3>

                    <p>
                        Team members will appear here
                        once they are added from the
                        admin panel.
                    </p>

                </div>
            `;

            return;
        }


        /* -------------------------------------------------
           Clear Container
        ------------------------------------------------- */

        teamContainer.innerHTML = "";


        /* -------------------------------------------------
           Create Team Cards
        ------------------------------------------------- */

        teamMembers.forEach(
            (member) => {

                const card =
                    document.createElement("div");


                card.className =
                    "team-card";


                /* -----------------------------------------
                   Name
                ----------------------------------------- */

                const name =
                    member.name ||
                    "Cold Cafe Team";


                /* -----------------------------------------
                   Position
                ----------------------------------------- */

                const position =
                    member.position ||
                    "Team Member";


                /* -----------------------------------------
                   Image
                ----------------------------------------- */

                const image =
                    member.image ||
                    "https://via.placeholder.com/600x600?text=Cold+Cafe";


                /* -----------------------------------------
                   Card HTML
                ----------------------------------------- */

                card.innerHTML = `

                    <div class="team-image">

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(name)}"
                            loading="lazy"
                        >

                    </div>

                    <div class="team-info">

                        <h3>
                            ${escapeHTML(name)}
                        </h3>

                        <span>
                            ${escapeHTML(position)}
                        </span>

                    </div>

                `;


                /* -----------------------------------------
                   Image Error Handling
                ----------------------------------------- */

                const teamImage =
                    card.querySelector("img");


                if (teamImage) {

                    teamImage.addEventListener(
                        "error",
                        function () {

                            teamImage.src =
                                "https://via.placeholder.com/600x600?text=Cold+Cafe";

                        }
                    );

                }


                /* -----------------------------------------
                   Add Card
                ----------------------------------------- */

                teamContainer.appendChild(card);

            }
        );

    }


    catch (error) {

        console.error(
            "Failed to load team:",
            error
        );


        /* -------------------------------------------------
           Error Message
        ------------------------------------------------- */

        teamContainer.innerHTML = `

            <div class="team-error">

                <i class="ri-error-warning-line"></i>

                <h3>
                    Unable to load our team
                </h3>

                <p>
                    Please try again later.
                </p>

                <button
                    type="button"
                    id="retryTeamBtn"
                >
                    Try Again
                </button>

            </div>

        `;


        /* -------------------------------------------------
           Retry
        ------------------------------------------------- */

        const retryButton =
            document.getElementById(
                "retryTeamBtn"
            );


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                loadTeam
            );

        }

    }

}


/* =====================================================
   REVIEW FORM ELEMENTS
====================================================== */

const reviewToggleBtn =
    document.getElementById(
        "reviewToggleBtn"
    );


const reviewFormContainer =
    document.getElementById(
        "reviewFormContainer"
    );


const reviewForm =
    document.getElementById(
        "reviewForm"
    );


const reviewCancelBtn =
    document.getElementById(
        "reviewCancelBtn"
    );


const starRating =
    document.getElementById(
        "starRating"
    );


const reviewRatingValue =
    document.getElementById(
        "reviewRatingValue"
    );


let selectedRating = 0;


/* =====================================================
   TOGGLE REVIEW FORM
====================================================== */

if (
    reviewToggleBtn &&
    reviewFormContainer
) {

    reviewToggleBtn.addEventListener(
        "click",
        function () {

            reviewFormContainer.classList.toggle(
                "active"
            );


            if (
                reviewFormContainer.classList.contains(
                    "active"
                )
            ) {

                reviewToggleBtn.innerHTML = `
                    <i class="ri-close-line"></i>
                    Close Form
                `;


                reviewFormContainer.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
            else {

                reviewToggleBtn.innerHTML = `
                    <i class="ri-quill-pen-line"></i>
                    Write a Review
                `;

            }

        }
    );

}


/* =====================================================
   CANCEL REVIEW FORM
====================================================== */

if (
    reviewCancelBtn &&
    reviewFormContainer
) {

    reviewCancelBtn.addEventListener(
        "click",
        function () {

            reviewFormContainer.classList.remove(
                "active"
            );


            if (reviewToggleBtn) {

                reviewToggleBtn.innerHTML = `
                    <i class="ri-quill-pen-line"></i>
                    Write a Review
                `;

            }


            if (reviewForm) {

                reviewForm.reset();

            }


            selectedRating = 0;


            if (reviewRatingValue) {

                reviewRatingValue.value = 0;

            }


            updateStars();

        }
    );

}


/* =====================================================
   STAR RATING
====================================================== */

if (starRating) {

    const stars =
        starRating.querySelectorAll("i");


    stars.forEach(
        (star) => {


            /* -----------------------------------------
               Click
            ----------------------------------------- */

            star.addEventListener(
                "click",
                function () {

                    selectedRating =
                        parseInt(
                            this.getAttribute(
                                "data-rating"
                            )
                        );


                    if (reviewRatingValue) {

                        reviewRatingValue.value =
                            selectedRating;

                    }


                    updateStars();

                }
            );


            /* -----------------------------------------
               Mouse Enter
            ----------------------------------------- */

            star.addEventListener(
                "mouseenter",
                function () {

                    const hoverValue =
                        parseInt(
                            this.getAttribute(
                                "data-rating"
                            )
                        );


                    stars.forEach(
                        (s) => {

                            const value =
                                parseInt(
                                    s.getAttribute(
                                        "data-rating"
                                    )
                                );


                            if (
                                value <= hoverValue
                            ) {

                                s.classList.remove(
                                    "ri-star-line"
                                );

                                s.classList.add(
                                    "ri-star-fill"
                                );

                                s.classList.add(
                                    "active"
                                );

                            }
                            else {

                                s.classList.remove(
                                    "ri-star-fill"
                                );

                                s.classList.add(
                                    "ri-star-line"
                                );

                                s.classList.remove(
                                    "active"
                                );

                            }

                        }
                    );

                }
            );


            /* -----------------------------------------
               Mouse Leave
            ----------------------------------------- */

            star.addEventListener(
                "mouseleave",
                function () {

                    updateStars();

                }
            );

        }
    );

}


/* =====================================================
   UPDATE STAR DISPLAY
====================================================== */

function updateStars() {

    if (!starRating) {
        return;
    }


    const stars =
        starRating.querySelectorAll("i");


    stars.forEach(
        (star) => {

            const value =
                parseInt(
                    star.getAttribute(
                        "data-rating"
                    )
                );


            if (
                value <= selectedRating
            ) {

                star.classList.remove(
                    "ri-star-line"
                );

                star.classList.add(
                    "ri-star-fill"
                );

                star.classList.add(
                    "active"
                );

            }
            else {

                star.classList.remove(
                    "ri-star-fill"
                );

                star.classList.add(
                    "ri-star-line"
                );

                star.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =====================================================
   SUBMIT REVIEW
   POST /api/reviews

   IMPORTANT:
   Review is sent ONLY to backend.
   It is NOT added to the frontend.
   It is NOT saved in localStorage.
====================================================== */

if (reviewForm) {

    reviewForm.addEventListener(
        "submit",
        async function (e) {

            e.preventDefault();


            /* -----------------------------------------
               Get Inputs
            ----------------------------------------- */

            const nameInput =
                document.getElementById(
                    "reviewName"
                );


            const reviewTextInput =
                document.getElementById(
                    "reviewText"
                );


            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";


            const rating =
                parseInt(
                    reviewRatingValue
                        ? reviewRatingValue.value
                        : 0
                );


            const reviewText =
                reviewTextInput
                    ? reviewTextInput.value.trim()
                    : "";


            /* -----------------------------------------
               Validation
            ----------------------------------------- */

            if (!name) {

                alert(
                    "Please enter your name."
                );

                return;

            }


            if (
                !rating ||
                rating < 1 ||
                rating > 5
            ) {

                alert(
                    "Please select a rating."
                );

                return;

            }


            if (!reviewText) {

                alert(
                    "Please write your review."
                );

                return;

            }


            /* -----------------------------------------
               API URL Check
            ----------------------------------------- */

            if (!API_URL) {

                console.error(
                    "VITE_API_URL is missing."
                );


                alert(
                    "API URL is not configured."
                );

                return;

            }


            /* -----------------------------------------
               Submit Button
            ----------------------------------------- */

            const submitButton =
                reviewForm.querySelector(
                    ".review-submit-btn"
                );


            const originalButtonHTML =
                submitButton
                    ? submitButton.innerHTML
                    : "";


            if (submitButton) {

                submitButton.disabled = true;


                submitButton.innerHTML = `
                    <i class="ri-loader-4-line"></i>
                    Submitting...
                `;

            }


            try {

                /* -----------------------------------------
                   SEND TO BACKEND
                ----------------------------------------- */

                const response =
                    await fetch(
                        `${API_URL}/api/reviews`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name: name,

                                rating: rating,

                                review: reviewText

                            })

                        }
                    );


                /* -----------------------------------------
                   Read Backend Response
                ----------------------------------------- */

                let data = null;


                try {

                    data =
                        await response.json();

                }
                catch (jsonError) {

                    data = null;

                }


                console.log(
                    "Review API response:",
                    data
                );


                /* -----------------------------------------
                   Backend Error
                ----------------------------------------- */

                if (!response.ok) {

                    throw new Error(
                        data &&
                        data.message
                            ? data.message
                            : `Failed to submit review. Status: ${response.status}`
                    );

                }


                /* -----------------------------------------
                   SUCCESS
                ----------------------------------------- */

                alert(
                    "Thank you! Your review has been submitted successfully."
                );


                /* -----------------------------------------
                   Reset Form
                ----------------------------------------- */

                reviewForm.reset();


                selectedRating = 0;


                if (reviewRatingValue) {

                    reviewRatingValue.value = 0;

                }


                updateStars();


                /* -----------------------------------------
                   Close Form
                ----------------------------------------- */

                if (reviewFormContainer) {

                    reviewFormContainer.classList.remove(
                        "active"
                    );

                }


                if (reviewToggleBtn) {

                    reviewToggleBtn.innerHTML = `
                        <i class="ri-quill-pen-line"></i>
                        Write a Review
                    `;

                }


                /*
                   IMPORTANT:
                   No testimonial card is created here.
                   No localStorage is used here.
                   No GET /api/reviews is called here.

                   Therefore the submitted review will
                   NOT appear on the public frontend.
                */

            }


            catch (error) {

                console.error(
                    "Failed to submit review:",
                    error
                );


                alert(
                    error.message ||
                    "Failed to submit review. Please try again."
                );

            }


            finally {

                if (submitButton) {

                    submitButton.disabled = false;

                    submitButton.innerHTML =
                        originalButtonHTML;

                }

            }

        }
    );

}


/* =====================================================
   ESCAPE HTML
   Used only for team data
====================================================== */

function escapeHTML(value) {

    const div =
        document.createElement("div");


    div.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return div.innerHTML;

}


/* =====================================================
   INITIALIZE ABOUT PAGE
====================================================== */

function initializeAboutPage() {

    loadTeam();

}


/* =====================================================
   DOM READY
====================================================== */

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAboutPage
    );

}
else {

    initializeAboutPage();

}