document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API CONFIGURATION
       IMPORTANT:
       Backend URL comes ONLY from .env
    ===================================================== */

    const API_BASE_URL =
        import.meta.env.VITE_API_URL;


    if (!API_BASE_URL) {

        console.error(
            "VITE_API_URL is missing from .env"
        );

        showError();

        return;
    }


    const API_URL =
        API_BASE_URL.replace(/\/+$/, "");


    const MEDIA_API_URL =
        `${API_URL}/api/media`;


    console.log(
        "Media API:",
        MEDIA_API_URL
    );



    /* =====================================================
       DOM ELEMENTS
    ===================================================== */

    const mediaGallery =
        document.getElementById("mediaGallery");

    const mediaCategories =
        document.getElementById("mediaCategories");

    const mediaLoading =
        document.getElementById("mediaLoading");

    const mediaEmpty =
        document.getElementById("mediaEmpty");

    const mediaError =
        document.getElementById("mediaError");

    const retryMedia =
        document.getElementById("retryMedia");


    /* LIGHTBOX */

    const mediaLightbox =
        document.getElementById("mediaLightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxTitle =
        document.getElementById("lightboxTitle");

    const lightboxDescription =
        document.getElementById(
            "lightboxDescription"
        );

    const lightboxCategory =
        document.getElementById(
            "lightboxCategory"
        );

    const lightboxClose =
        document.getElementById(
            "lightboxClose"
        );

    const lightboxPrev =
        document.getElementById(
            "lightboxPrev"
        );

    const lightboxNext =
        document.getElementById(
            "lightboxNext"
        );


    /* NAVBAR */

    const menuToggle =
        document.getElementById(
            "menuToggle"
        );

    const navLinks =
        document.getElementById(
            "navLinks"
        );



    /* =====================================================
       STATE
    ===================================================== */

    let mediaItems = [];

    let filteredMedia = [];

    let currentCategory = "all";

    let currentIndex = 0;

    let isLoading = false;



    /* =====================================================
       TEXT HELPERS
    ===================================================== */

    function normalizeText(value) {

        return String(value || "")
            .toLowerCase()
            .trim()
            .replace(/\s+/g, " ");
    }


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
       BACKEND DATA HELPERS

       Backend model:

       id
       title
       description
       image
       category
    ===================================================== */

    function getTitle(item) {

        return (
            item?.title ||
            "Cold Cafe Moment"
        )
            .toString()
            .trim();
    }


    function getDescription(item) {

        return (
            item?.description ||
            ""
        )
            .toString()
            .trim();
    }


    function getCategory(item) {

        return (
            item?.category ||
            ""
        )
            .toString()
            .trim();
    }


    function getImage(item) {

        return (
            item?.image ||
            ""
        )
            .toString()
            .trim();
    }



    /* =====================================================
       IMAGE URL HANDLER

       If backend returns:

       https://....

       use directly.

       If backend returns:

       /uploads/media/image.jpg

       attach API base URL.
    ===================================================== */

    function getImageURL(item) {

        const image =
            getImage(item);


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


        /* Protocol relative */

        if (
            image.startsWith("//")
        ) {

            return (
                window.location.protocol +
                image
            );
        }


        /* Backend absolute path */

        if (
            image.startsWith("/")
        ) {

            return (
                API_URL +
                image
            );
        }


        /* Backend relative path */

        return (
            API_URL +
            "/" +
            image.replace(
                /^\.?\//,
                ""
            )
        );
    }



    /* =====================================================
       RESPONSE HANDLER
    ===================================================== */

    function extractMedia(response) {

        /*
         * Backend currently returns:

         [
             {
                 id,
                 title,
                 description,
                 image,
                 category
             }
         ]
        */

        if (
            Array.isArray(response)
        ) {

            return response;
        }


        /*
         * Future-safe support
        */

        if (
            response &&
            Array.isArray(
                response.media
            )
        ) {

            return response.media;
        }


        if (
            response &&
            Array.isArray(
                response.data
            )
        ) {

            return response.data;
        }


        return [];
    }



    /* =====================================================
       UI STATES
    ===================================================== */

    function showLoading() {

        if (mediaLoading) {

            mediaLoading.classList.add(
                "show"
            );
        }


        mediaEmpty?.classList.remove(
            "show"
        );

        mediaError?.classList.remove(
            "show"
        );
    }


    function hideLoading() {

        mediaLoading?.classList.remove(
            "show"
        );
    }


    function showEmpty() {

        hideLoading();


        mediaEmpty?.classList.add(
            "show"
        );


        mediaError?.classList.remove(
            "show"
        );
    }


    function showError() {

        hideLoading();


        mediaEmpty?.classList.remove(
            "show"
        );


        mediaError?.classList.add(
            "show"
        );
    }


    function hideAllStates() {

        hideLoading();


        mediaEmpty?.classList.remove(
            "show"
        );


        mediaError?.classList.remove(
            "show"
        );
    }



    /* =====================================================
       FETCH MEDIA
    ===================================================== */

    async function fetchMedia() {

        const response =
            await fetch(
                MEDIA_API_URL,
                {
                    method: "GET",

                    headers: {
                        Accept:
                            "application/json"
                    },

                    cache:
                        "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Media API failed: ${response.status}`
            );
        }


        const responseData =
            await response.json();


        console.log(
            "Media data from backend:",
            responseData
        );


        return extractMedia(
            responseData
        );
    }



    /* =====================================================
       CATEGORY LIST
    ===================================================== */

    function getCategories() {

        const categories = [];

        const existing =
            new Set();


        mediaItems.forEach(item => {

            const category =
                getCategory(item);


            if (!category) {

                return;
            }


            const key =
                normalizeText(
                    category
                );


            if (
                existing.has(key)
            ) {

                return;
            }


            existing.add(key);

            categories.push(
                category
            );

        });


        return categories;
    }



    /* =====================================================
       RENDER CATEGORY BUTTONS
    ===================================================== */

    function renderCategories() {

        if (!mediaCategories) {

            return;
        }


        mediaCategories.innerHTML = "";


        /* ALL */

        const allButton =
            document.createElement(
                "button"
            );


        allButton.type =
            "button";


        allButton.className =
            "media-filter";


        allButton.dataset.category =
            "all";


        allButton.textContent =
            "All";


        if (
            currentCategory ===
            "all"
        ) {

            allButton.classList.add(
                "active"
            );
        }


        mediaCategories.appendChild(
            allButton
        );


        /* BACKEND CATEGORIES */

        const categories =
            getCategories();


        categories.forEach(
            category => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "media-filter";


                button.dataset.category =
                    normalizeText(
                        category
                    );


                button.textContent =
                    category;


                if (
                    currentCategory ===
                    normalizeText(
                        category
                    )
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                mediaCategories.appendChild(
                    button
                );

            }
        );
    }



    /* =====================================================
       FILTER MEDIA
    ===================================================== */

    function getFilteredMedia() {

        if (
            currentCategory ===
            "all"
        ) {

            return [
                ...mediaItems
            ];
        }


        return mediaItems.filter(
            item => {

                return (
                    normalizeText(
                        getCategory(item)
                    ) ===
                    currentCategory
                );

            }
        );
    }



    /* =====================================================
       RENDER GALLERY
    ===================================================== */

    function renderGallery() {

        if (!mediaGallery) {

            return;
        }


        mediaGallery.innerHTML = "";


        filteredMedia =
            getFilteredMedia();


        if (
            filteredMedia.length === 0
        ) {

            showEmpty();

            return;
        }


        hideAllStates();


        filteredMedia.forEach(
            (item, index) => {

                const image =
                    getImageURL(item);


                /*
                 * Do not render broken records.
                 */

                if (!image) {

                    return;
                }


                const title =
                    getTitle(item);


                const description =
                    getDescription(item);


                const category =
                    getCategory(item);


                /*
                 * IMPORTANT:
                 * This class is now styled
                 * in media.css.
                 */

                const card =
                    document.createElement(
                        "article"
                    );


                card.className =
                    "media-card";


                card.innerHTML = `

                    <button
                        type="button"
                        class="media-card-button"
                        aria-label="Open ${escapeHTML(title)}"
                    >

                        <img
                            src="${escapeHTML(image)}"
                            alt="${escapeHTML(title)}"
                            loading="lazy"
                            decoding="async"
                        >


                        <div class="media-card-overlay">

                            <div class="media-card-info">

                                ${
                                    category
                                        ? `
                                            <span>
                                                ${escapeHTML(category)}
                                            </span>
                                          `
                                        : ""
                                }


                                <h3>
                                    ${escapeHTML(title)}
                                </h3>


                                ${
                                    description
                                        ? `
                                            <p>
                                                ${escapeHTML(description)}
                                            </p>
                                          `
                                        : ""
                                }

                            </div>


                            <span
                                class="media-card-icon"
                                aria-hidden="true"
                            >

                                <i class="ri-expand-diagonal-line"></i>

                            </span>

                        </div>

                    </button>

                `;


                const imageElement =
                    card.querySelector(
                        "img"
                    );


                /*
                 * IMAGE LOAD ERROR
                 */

                imageElement.addEventListener(
                    "error",
                    () => {

                        console.error(
                            "Failed image:",
                            image
                        );


                        card.remove();


                        if (
                            mediaGallery.children
                                .length === 0
                        ) {

                            showEmpty();
                        }

                    }
                );


                /*
                 * IMAGE CLICK
                 */

                const cardButton =
                    card.querySelector(
                        ".media-card-button"
                    );


                cardButton.addEventListener(
                    "click",
                    () => {

                        openLightbox(
                            index
                        );

                    }
                );


                mediaGallery.appendChild(
                    card
                );

            }
        );


        /*
         * Check if nothing
         * actually rendered.
         */

        if (
            mediaGallery.children
                .length === 0
        ) {

            showEmpty();
        }
    }



    /* =====================================================
       CATEGORY CLICK
    ===================================================== */

    function setupCategoryEvents() {

        if (!mediaCategories) {

            return;
        }


        mediaCategories.addEventListener(
            "click",
            event => {

                const button =
                    event.target.closest(
                        ".media-filter"
                    );


                if (!button) {

                    return;
                }


                currentCategory =
                    button.dataset.category ||
                    "all";


                mediaCategories
                    .querySelectorAll(
                        ".media-filter"
                    )
                    .forEach(
                        filterButton => {

                            filterButton.classList.toggle(
                                "active",
                                filterButton ===
                                button
                            );

                        }
                    );


                renderGallery();
            }
        );
    }



    /* =====================================================
       LIGHTBOX
    ===================================================== */

    function openLightbox(index) {

        if (
            filteredMedia.length === 0
        ) {

            return;
        }


        currentIndex =
            index;


        updateLightbox();


        mediaLightbox?.classList.add(
            "show"
        );


        mediaLightbox?.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "lightbox-open"
        );
    }



    function updateLightbox() {

        const item =
            filteredMedia[
                currentIndex
            ];


        if (!item) {

            return;
        }


        const image =
            getImageURL(item);


        const title =
            getTitle(item);


        const description =
            getDescription(item);


        const category =
            getCategory(item);


        if (lightboxImage) {

            lightboxImage.src =
                image;

            lightboxImage.alt =
                title;
        }


        if (lightboxTitle) {

            lightboxTitle.textContent =
                title;
        }


        if (lightboxDescription) {

            lightboxDescription.textContent =
                description;
        }


        if (lightboxCategory) {

            lightboxCategory.textContent =
                category;
        }


        const hasMultiple =
            filteredMedia.length > 1;


        if (lightboxPrev) {

            lightboxPrev.disabled =
                !hasMultiple;
        }


        if (lightboxNext) {

            lightboxNext.disabled =
                !hasMultiple;
        }
    }



    function closeLightbox() {

        mediaLightbox?.classList.remove(
            "show"
        );


        mediaLightbox?.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "lightbox-open"
        );


        if (lightboxImage) {

            lightboxImage.src =
                "";
        }
    }



    function showPrevious() {

        if (
            filteredMedia.length <= 1
        ) {

            return;
        }


        currentIndex--;


        if (
            currentIndex < 0
        ) {

            currentIndex =
                filteredMedia.length - 1;
        }


        updateLightbox();
    }



    function showNext() {

        if (
            filteredMedia.length <= 1
        ) {

            return;
        }


        currentIndex++;


        if (
            currentIndex >=
            filteredMedia.length
        ) {

            currentIndex = 0;
        }


        updateLightbox();
    }



    /* =====================================================
       LIGHTBOX EVENTS
    ===================================================== */

    function setupLightboxEvents() {

        lightboxClose?.addEventListener(
            "click",
            closeLightbox
        );


        lightboxPrev?.addEventListener(
            "click",
            showPrevious
        );


        lightboxNext?.addEventListener(
            "click",
            showNext
        );


        /*
         * Close when clicking background.
         */

        mediaLightbox?.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    mediaLightbox
                ) {

                    closeLightbox();
                }

            }
        );


        /*
         * Keyboard navigation.
         */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    !mediaLightbox?.classList.contains(
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
                    "ArrowLeft"
                ) {

                    showPrevious();
                }


                if (
                    event.key ===
                    "ArrowRight"
                ) {

                    showNext();
                }

            }
        );
    }



    /* =====================================================
       MOBILE NAVBAR
    ===================================================== */

    function setupMobileNavbar() {

        if (
            !menuToggle ||
            !navLinks
        ) {

            return;
        }


        menuToggle.addEventListener(
            "click",
            () => {

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


        /*
         * Close menu after
         * clicking a navigation link.
         */

        navLinks
            .querySelectorAll("a")
            .forEach(
                link => {

                    link.addEventListener(
                        "click",
                        () => {

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


        /*
         * Close menu if user
         * clicks outside navbar.
         */

        document.addEventListener(
            "click",
            event => {

                const navbar =
                    document.querySelector(
                        ".navbar"
                    );


                if (
                    !navbar?.contains(
                        event.target
                    )
                ) {

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

            }
        );
    }



    /* =====================================================
       LOAD MEDIA
    ===================================================== */

    async function loadMedia() {

        if (isLoading) {

            return;
        }


        isLoading =
            true;


        showLoading();


        try {

            console.log(
                "Fetching media from:",
                MEDIA_API_URL
            );


            const data =
                await fetchMedia();


            mediaItems =
                Array.isArray(data)
                    ? data
                    : [];


            console.log(
                "Media count:",
                mediaItems.length
            );


            if (
                mediaItems.length === 0
            ) {

                renderCategories();

                showEmpty();

                return;
            }


            currentCategory =
                "all";


            renderCategories();

            renderGallery();

        }

        catch (error) {

            console.error(
                "Media API error:",
                error
            );


            showError();

        }

        finally {

            isLoading =
                false;
        }
    }



    /* =====================================================
       RETRY
    ===================================================== */

    retryMedia?.addEventListener(
        "click",
        loadMedia
    );



    /* =====================================================
       INITIALIZE
    ===================================================== */

    setupCategoryEvents();

    setupLightboxEvents();

    setupMobileNavbar();

    loadMedia();

});