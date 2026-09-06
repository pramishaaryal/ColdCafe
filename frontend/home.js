/* =====================================================
   COLD CAFE HOME PAGE
   =====================================================

   This file handles:

   1. Special Menu
   2. Best Sellers
   3. Home Gallery
   4. Gallery Lightbox
   5. Home Contact Form
   6. Mobile Hamburger Menu

===================================================== */


/* =====================================================
   API CONFIGURATION
===================================================== */

const API_BASE_URL =
    String(
        import.meta.env.VITE_API_URL ||
        "https://cold-cafe-backend-1.onrender.com"
    ).replace(/\/+$/, "");


const HOME_API_URL =
    `${API_BASE_URL}/api/home`;


/* =====================================================
   DOM ELEMENTS
===================================================== */

const specialMenuContainer =
    document.getElementById(
        "specialMenuContainer"
    );


const bestSellerContainer =
    document.getElementById(
        "bestSellerContainer"
    );


const galleryContainer =
    document.getElementById(
        "homeGalleryGrid"
    );



/* =====================================================
   HELPER
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

    const element =
        document.createElement("div");


    element.textContent =
        value === null ||
        value === undefined
            ? ""
            : String(value);


    return element.innerHTML;

}



/* =====================================================
   IMAGE URL
===================================================== */

function getImageURL(value) {

    const image =
        String(value || "").trim();


    if (!image) {

        return "";

    }


    /* Full URL */

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    /* Protocol-relative URL */

    if (image.startsWith("//")) {

        return (
            window.location.protocol +
            image
        );

    }


    /* Absolute backend path */

    if (image.startsWith("/")) {

        return (
            API_BASE_URL +
            image
        );

    }


    /* Relative path */

    return (
        API_BASE_URL +
        "/" +
        image.replace(/^\.?\//, "")
    );

}



/* =====================================================
   GET IMAGE
===================================================== */

function getImage(item) {

    return getImageURL(

        item?.image ||
        item?.imageUrl ||
        item?.imageURL ||
        item?.url ||
        item?.photo ||
        ""

    );

}



/* =====================================================
   FORMAT PRICE
===================================================== */

function formatPrice(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {

        return "";

    }


    const number =
        Number(value);


    if (!Number.isFinite(number)) {

        return String(value);

    }


    return Number.isInteger(number)

        ? `Rs. ${number}`

        : `Rs. ${number.toFixed(2)}`;

}



/* =====================================================
   GET JSON
===================================================== */

async function getJSON(url) {

    const response =
        await fetch(

            url,

            {
                method: "GET",

                headers: {
                    Accept:
                        "application/json"
                },

                cache: "no-store"
            }

        );


    const text =
        await response.text();


    let data = {};


    try {

        data =
            text
                ? JSON.parse(text)
                : {};

    } catch (error) {

        throw new Error(
            `Invalid JSON response from ${url}`
        );

    }


    if (!response.ok) {

        throw new Error(

            data?.message ||
            `Request failed with status ${response.status}`

        );

    }


    return data;

}



/* =====================================================
   EXTRACT ARRAY
===================================================== */

function extractArray(
    data,
    keys = []
) {

    if (Array.isArray(data)) {

        return data;

    }


    for (
        const key of keys
    ) {

        if (
            data &&
            Array.isArray(data[key])
        ) {

            return data[key];

        }

    }


    if (
        data &&
        data.data &&
        Array.isArray(data.data)
    ) {

        return data.data;

    }


    if (
        data &&
        data.results &&
        Array.isArray(data.results)
    ) {

        return data.results;

    }


    return [];

}



/* =====================================================
   RENDER MESSAGE
===================================================== */

function renderMessage(
    container,
    message
) {

    if (!container) {

        return;

    }


    container.innerHTML = `

        <p
            style="
                grid-column:1/-1;
                width:100%;
                text-align:center;
                padding:30px 10px;
            "
        >

            ${escapeHTML(message)}

        </p>

    `;

}



/* =====================================================
   SPECIAL MENU
   GET /api/home/specialmenu
===================================================== */

function renderSpecialMenu(items) {

    if (!specialMenuContainer) {

        return;

    }


    if (!items.length) {

        renderMessage(
            specialMenuContainer,
            "No special menu items available right now."
        );

        return;

    }


    specialMenuContainer.innerHTML =

        items.map(
            function (item) {

                const name =
                    item?.name ||
                    item?.title ||
                    "Special Menu";


                const description =
                    item?.description ||
                    "";


                const image =
                    getImage(item);


                const imageHTML =
                    image

                        ? `

                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(name)}"
                                loading="lazy"
                                onerror="this.style.display='none';"
                            >

                        `

                        : "";


                return `

                    <div class="card">

                        <div class="card-img">

                            ${imageHTML}

                        </div>


                        <div class="card-content">

                            <h3>
                                ${escapeHTML(name)}
                            </h3>


                            <p>
                                ${escapeHTML(description)}
                            </p>


                            <div class="price">

                                <h4>
                                    ${escapeHTML(
                                        formatPrice(
                                            item?.price
                                        )
                                    )}
                                </h4>


                                <a
                                    href="menu.html"
                                    aria-label="View ${escapeHTML(name)}"
                                >

                                    <i class="ri-shopping-bag-3-fill"></i>

                                </a>

                            </div>

                        </div>

                    </div>

                `;

            }
        ).join("");

}



async function loadSpecialMenu() {

    if (!specialMenuContainer) {

        return;

    }


    try {

        const data =
            await getJSON(
                `${HOME_API_URL}/specialmenu`
            );


        const items =
            extractArray(
                data,
                [
                    "specialMenu",
                    "products",
                    "items"
                ]
            );


        renderSpecialMenu(items);

    } catch (error) {

        console.error(
            "Special Menu API Error:",
            error
        );


        renderMessage(
            specialMenuContainer,
            "Unable to load the special menu."
        );

    }

}



/* =====================================================
   BEST SELLERS
   GET /api/home/Bestsellers
===================================================== */

function renderBestSellers(items) {

    if (!bestSellerContainer) {

        return;

    }


    if (!items.length) {

        renderMessage(
            bestSellerContainer,
            "No best sellers available right now."
        );

        return;

    }


    bestSellerContainer.innerHTML =

        items.map(
            function (item) {

                const title =
                    item?.title ||
                    item?.name ||
                    "Best Seller";


                const description =
                    item?.description ||
                    "";


                const image =
                    getImage(item);


                const imageHTML =
                    image

                        ? `

                            <img
                                src="${escapeHTML(image)}"
                                alt="${escapeHTML(title)}"
                                loading="lazy"
                                onerror="this.style.display='none';"
                            >

                        `

                        : `

                            <div
                                style="
                                    height:370px;
                                    background:#fff;
                                "
                            ></div>

                        `;


                return `

                    <div class="best-card">

                        ${imageHTML}


                        <div class="best-content">

                            <h3>
                                ${escapeHTML(title)}
                            </h3>


                            <p>
                                ${escapeHTML(description)}
                            </p>


                            <span>

                                ${escapeHTML(
                                    formatPrice(
                                        item?.price
                                    )
                                )}

                            </span>

                        </div>

                    </div>

                `;

            }
        ).join("");

}



async function loadBestSellers() {

    if (!bestSellerContainer) {

        return;

    }


    try {

        const data =
            await getJSON(
                `${HOME_API_URL}/Bestsellers`
            );


        const items =
            extractArray(
                data,
                [
                    "bestSellers",
                    "bestsellers",
                    "items"
                ]
            );


        renderBestSellers(items);

    } catch (error) {

        console.error(
            "Best Sellers API Error:",
            error
        );


        renderMessage(
            bestSellerContainer,
            "Unable to load best sellers."
        );

    }

}



/* =====================================================
   MEDIA GALLERY
===================================================== */


/*
   These variables and functions are kept
   from the original script.js functionality.
*/

let galleryImages = [];

let currentImage = 0;



/* =====================================================
   LIGHTBOX ELEMENTS
===================================================== */

const lightbox =
    document.getElementById(
        "lightbox"
    );


const lightboxImage =
    document.getElementById(
        "lightboxImage"
    );


const lightboxTitle =
    document.getElementById(
        "lightboxTitle"
    );


const closeButton =
    document.getElementById(
        "lightboxClose"
    );


const previousButton =
    document.getElementById(
        "lightboxPrev"
    );


const nextButton =
    document.getElementById(
        "lightboxNext"
    );



/* =====================================================
   STORE IMAGES
===================================================== */

function storeGalleryImages() {

    if (!galleryContainer) {

        return;

    }


    const galleryButtons =
        galleryContainer.querySelectorAll(
            ".view-btn"
        );


    galleryImages = [];


    galleryButtons.forEach(
        function (button) {

            galleryImages.push({

                image:
                    button.dataset.image,

                title:
                    button.dataset.title

            });

        }
    );

}



/* =====================================================
   OPEN LIGHTBOX
===================================================== */

function openLightbox(index) {

    if (
        !lightbox ||
        !lightboxImage ||
        !lightboxTitle ||
        !galleryImages.length
    ) {

        return;

    }


    currentImage =
        index;


    const image =
        galleryImages[currentImage];


    if (!image) {

        return;

    }


    lightboxImage.src =
        image.image;


    lightboxImage.alt =
        image.title;


    lightboxTitle.textContent =
        image.title;


    lightbox.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";

}



/* =====================================================
   CLOSE LIGHTBOX
===================================================== */

function closeLightbox() {

    if (!lightbox) {

        return;

    }


    lightbox.classList.remove(
        "show"
    );


    document.body.style.overflow =
        "";

}



/* =====================================================
   NEXT IMAGE
===================================================== */

function nextImage() {

    if (!galleryImages.length) {

        return;

    }


    currentImage++;


    if (
        currentImage >=
        galleryImages.length
    ) {

        currentImage = 0;

    }


    updateLightboxImage();

}



/* =====================================================
   PREVIOUS IMAGE
===================================================== */

function previousImage() {

    if (!galleryImages.length) {

        return;

    }


    currentImage--;


    if (currentImage < 0) {

        currentImage =
            galleryImages.length - 1;

    }


    updateLightboxImage();

}



/* =====================================================
   UPDATE LIGHTBOX
===================================================== */

function updateLightboxImage() {

    if (
        !lightboxImage ||
        !lightboxTitle ||
        !galleryImages.length
    ) {

        return;

    }


    const image =
        galleryImages[currentImage];


    if (!image) {

        return;

    }


    lightboxImage.src =
        image.image;


    lightboxImage.alt =
        image.title;


    lightboxTitle.textContent =
        image.title;

}



/* =====================================================
   GALLERY BUTTON EVENTS
===================================================== */

function setupGalleryEvents() {

    if (!galleryContainer) {

        return;

    }


    /*
       Event delegation is used because
       gallery images come from backend dynamically.
    */

    galleryContainer.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    ".view-btn"
                );


            if (!button) {

                return;

            }


            event.stopPropagation();


            storeGalleryImages();


            const buttons =
                galleryContainer.querySelectorAll(
                    ".view-btn"
                );


            const index =
                Array.from(buttons)
                    .indexOf(button);


            if (index !== -1) {

                openLightbox(index);

            }

        }
    );

}



/* =====================================================
   LIGHTBOX BUTTON EVENTS
===================================================== */

if (closeButton) {

    closeButton.addEventListener(
        "click",
        closeLightbox
    );

}


if (nextButton) {

    nextButton.addEventListener(
        "click",
        nextImage
    );

}


if (previousButton) {

    previousButton.addEventListener(
        "click",
        previousImage
    );

}



/* =====================================================
   CLICK OUTSIDE IMAGE
===================================================== */

if (lightbox) {

    lightbox.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                lightbox
            ) {

                closeLightbox();

            }

        }
    );

}



/* =====================================================
   KEYBOARD CONTROL
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            !lightbox ||
            !lightbox.classList.contains(
                "show"
            )
        ) {

            return;

        }


        if (
            event.key ===
            "Escape"
        ) {

            closeLightbox();

        }


        if (
            event.key ===
            "ArrowRight"
        ) {

            nextImage();

        }


        if (
            event.key ===
            "ArrowLeft"
        ) {

            previousImage();

        }

    }
);



/* =====================================================
   LOAD HOME GALLERY
   GET /api/home/Gallery
===================================================== */

function renderGallery(items) {

    if (!galleryContainer) {

        return;

    }


    if (!items.length) {

        renderMessage(
            galleryContainer,
            "No gallery photos available right now."
        );

        return;

    }


    galleryContainer.innerHTML =

        items.map(
            function (item, index) {

                const image =
                    getImage(item);


                if (!image) {

                    return "";

                }


                const title =
                    item?.title ||
                    item?.name ||
                    `Cold Cafe Gallery ${index + 1}`;


                /*
                   Image itself remains visually
                   the same as the existing design.

                   A hidden view button is added only
                   for the original lightbox system.
                */

                return `

                    <div
                        class="home-gallery-item"
                        style="
                            position:relative;
                            width:100%;
                            height:100%;
                        "
                    >

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(title)}"
                            loading="lazy"
                            style="
                                width:100%;
                                height:100%;
                                object-fit:cover;
                            "
                            onerror="this.parentElement.remove();"
                        >


                        <button
                            type="button"
                            class="view-btn"
                            data-image="${escapeHTML(image)}"
                            data-title="${escapeHTML(title)}"
                            aria-label="View ${escapeHTML(title)}"
                            style="
                                position:absolute;
                                inset:0;
                                width:100%;
                                height:100%;
                                opacity:0;
                                cursor:pointer;
                                background:transparent;
                                border:0;
                            "
                        >
                        </button>

                    </div>

                `;

            }
        ).join("");


    storeGalleryImages();

}



async function loadGallery() {

    if (!galleryContainer) {

        return;

    }


    try {

        const data =
            await getJSON(
                `${HOME_API_URL}/Gallery`
            );


        const items =
            extractArray(
                data,
                [
                    "gallery",
                    "items"
                ]
            );


        renderGallery(items);

    } catch (error) {

        console.error(
            "Gallery API Error:",
            error
        );


        renderMessage(
            galleryContainer,
            "Unable to load the gallery."
        );

    }

}



/* =====================================================
   HOME CONTACT FORM
   POST /api/contacts
===================================================== */

const homeContactForm =
    document.getElementById(
        "homeContactForm"
    );


const homeContactStatus =
    document.getElementById(
        "homeContactStatus"
    );


const homeSubmitButton =
    document.getElementById(
        "homeSubmitButton"
    );



/* =====================================================
   SHOW CONTACT MESSAGE
===================================================== */

function showHomeContactMessage(
    message,
    type
) {

    if (!homeContactStatus) {

        return;

    }


    homeContactStatus.textContent =
        message;


    homeContactStatus.style.display =
        "block";


    homeContactStatus.style.marginTop =
        "12px";


    homeContactStatus.style.textAlign =
        "center";


    homeContactStatus.style.fontSize =
        "14px";


    if (type === "success") {

        homeContactStatus.style.color =
            "green";

    } else {

        homeContactStatus.style.color =
            "red";

    }

}



/* =====================================================
   HIDE CONTACT MESSAGE
===================================================== */

function hideHomeContactMessage() {

    if (!homeContactStatus) {

        return;

    }


    homeContactStatus.textContent =
        "";


    homeContactStatus.style.display =
        "none";

}



/* =====================================================
   CONTACT FORM SUBMIT
===================================================== */

if (homeContactForm) {

    homeContactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* -----------------------------------------
               GET VALUES
            ----------------------------------------- */

            const name =
                document
                    .getElementById(
                        "homeName"
                    )
                    ?.value
                    .trim();


            const email =
                document
                    .getElementById(
                        "homeEmail"
                    )
                    ?.value
                    .trim();


            const phone =
                document
                    .getElementById(
                        "homePhone"
                    )
                    ?.value
                    .trim();


            const message =
                document
                    .getElementById(
                        "homeMessage"
                    )
                    ?.value
                    .trim();



            /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

            if (
                !name ||
                !email ||
                !phone ||
                !message
            ) {

                showHomeContactMessage(
                    "All fields are required!",
                    "error"
                );

                return;

            }



            /* -----------------------------------------
               EMAIL VALIDATION
            ----------------------------------------- */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email
                )
            ) {

                showHomeContactMessage(
                    "Please enter a valid email address.",
                    "error"
                );

                return;

            }



            /* -----------------------------------------
               PHONE VALIDATION
            ----------------------------------------- */

            if (
                phone.length < 7
            ) {

                showHomeContactMessage(
                    "Please enter a valid phone number.",
                    "error"
                );

                return;

            }



            /* -----------------------------------------
               HIDE OLD MESSAGE
            ----------------------------------------- */

            hideHomeContactMessage();



            /* -----------------------------------------
               BUTTON LOADING
            ----------------------------------------- */

            let originalButtonHTML = "";


            if (homeSubmitButton) {

                originalButtonHTML =
                    homeSubmitButton.innerHTML;


                homeSubmitButton.disabled =
                    true;


                homeSubmitButton.innerHTML = `

                    <i class="ri-loader-4-line"></i>

                    <span>
                        Sending...
                    </span>

                `;

            }



            /* -----------------------------------------
               SEND TO BACKEND
            ----------------------------------------- */

            try {

                const response =
                    await fetch(

                        `${API_BASE_URL}/api/contacts`,

                        {

                            method: "POST",

                            headers: {

                                "Content-Type":
                                    "application/json",

                                "Accept":
                                    "application/json"

                            },

                            body: JSON.stringify({

                                name:
                                    name,

                                email:
                                    email,

                                phone:
                                    phone,

                                message:
                                    message

                            })

                        }

                    );


                /* -------------------------------------
                   READ RESPONSE
                ------------------------------------- */

                const text =
                    await response.text();


                let data = {};


                try {

                    data =
                        text
                            ? JSON.parse(text)
                            : {};

                } catch (error) {

                    data = {};

                }



                /* -------------------------------------
                   ERROR
                ------------------------------------- */

                if (!response.ok) {

                    throw new Error(

                        data?.message ||
                        "Failed to send your message."

                    );

                }



                /* -------------------------------------
                   SUCCESS
                ------------------------------------- */

                showHomeContactMessage(

                    data?.message ||
                    "Your message has been sent successfully!",

                    "success"

                );


                /* Clear form */

                homeContactForm.reset();


                /* Hide message after 5 seconds */

                setTimeout(
                    function () {

                        hideHomeContactMessage();

                    },
                    5000
                );


            } catch (error) {

                console.error(
                    "Home Contact Form Error:",
                    error
                );


                let errorMessage =
                    error?.message ||
                    "Something went wrong. Please try again.";


                if (
                    error instanceof TypeError &&
                    error.message ===
                        "Failed to fetch"
                ) {

                    errorMessage =
                        "Unable to connect to the server. Please try again later.";

                }


                showHomeContactMessage(
                    errorMessage,
                    "error"
                );


            } finally {

                /* -------------------------------------
                   RESTORE BUTTON
                ------------------------------------- */

                if (homeSubmitButton) {

                    homeSubmitButton.disabled =
                        false;


                    homeSubmitButton.innerHTML =
                        originalButtonHTML;

                }

            }

        }
    );

}



/* =====================================================
   MOBILE HAMBURGER MENU
===================================================== */

const menuToggle =
    document.getElementById(
        "menuToggle"
    );


const navLinks =
    document.getElementById(
        "navLinks"
    );


if (
    menuToggle &&
    navLinks
) {

    menuToggle.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();


            const isOpen =
                navLinks.classList.toggle(
                    "open"
                );


            menuToggle.setAttribute(
                "aria-expanded",
                String(isOpen)
            );


            menuToggle.innerHTML =
                isOpen

                    ? '<i class="ri-close-line"></i>'

                    : '<i class="ri-menu-3-line"></i>';

        }
    );



    navLinks
        .querySelectorAll("a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        navLinks.classList.remove(
                            "open"
                        );


                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );


                        menuToggle.innerHTML =
                            '<i class="ri-menu-3-line"></i>';

                    }
                );

            }
        );



    document.addEventListener(
        "click",
        function (event) {

            const navbar =
                document.querySelector(
                    ".navbar"
                );


            if (
                !navbar ||
                navbar.contains(
                    event.target
                )
            ) {

                return;

            }


            navLinks.classList.remove(
                "open"
            );


            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );


            menuToggle.innerHTML =
                '<i class="ri-menu-3-line"></i>';

        }
    );

}



/* =====================================================
   LOAD HOME DATA
===================================================== */

loadSpecialMenu();

loadBestSellers();

loadGallery();