document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       API CONFIGURATION
       API ONLY FROM .env
       VITE_API_URL=your-backend-url
    ====================================================== */

    const API_BASE_URL =
        import.meta.env.VITE_API_URL;

    if (!API_BASE_URL) {
        console.error(
            "VITE_API_URL is missing from .env"
        );
    }

    const API_URL =
        String(API_BASE_URL || "")
            .replace(/\/+$/, "");

    const MEDIA_API_URL =
        `${API_URL}/api/media`;


    /* =====================================================
       DOM ELEMENTS
    ====================================================== */

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


    /* =====================================================
       LIGHTBOX
    ====================================================== */

    const mediaLightbox =
        document.getElementById("mediaLightbox");

    const lightboxImage =
        document.getElementById("lightboxImage");

    const lightboxTitle =
        document.getElementById("lightboxTitle");

    const lightboxDescription =
        document.getElementById("lightboxDescription");

    const lightboxCategory =
        document.getElementById("lightboxCategory");

    const lightboxClose =
        document.getElementById("lightboxClose");

    const lightboxPrev =
        document.getElementById("lightboxPrev");

    const lightboxNext =
        document.getElementById("lightboxNext");


    /* =====================================================
       NAVBAR
    ====================================================== */

    const menuToggle =
        document.getElementById("menuToggle");

    const navLinks =
        document.getElementById("navLinks");


    /* =====================================================
       STATE
    ====================================================== */

    let mediaItems = [];

    let filteredMedia = [];

    let currentCategory = "all";

    let currentIndex = 0;

    let lightboxItems = [];

    let isLoading = false;


    /* =====================================================
       HELPERS
    ====================================================== */

    function normalizeText(value) {

        return String(value ?? "")
            .trim()
            .toLowerCase()
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
    ====================================================== */

    function getId(item) {

        return item?.id ?? "";
    }


    function getTitle(item) {

        const value =
            item?.title;

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim()
        ) {
            return String(value).trim();
        }

        return "Cold Cafe Moment";
    }


    function getDescription(item) {

        const value =
            item?.description;

        if (
            value !== null &&
            value !== undefined
        ) {
            return String(value).trim();
        }

        return "";
    }


    function getEventType(item) {

        const value =
            item?.eventType;

        if (
            value !== null &&
            value !== undefined &&
            String(value).trim()
        ) {
            return String(value).trim();
        }

        return "";
    }


    function getImage(item) {

        const value =
            item?.image;

        if (
            value !== null &&
            value !== undefined
        ) {
            return String(value).trim();
        }

        return "";
    }


    /* =====================================================
       IMAGE URL
    ====================================================== */

    function getImageURL(item) {

        const image =
            getImage(item);

        if (!image) {
            return "";
        }


        /* Already complete URL */

        if (
            image.startsWith("http://") ||
            image.startsWith("https://")
        ) {
            return image;
        }


        /* Protocol-relative URL */

        if (
            image.startsWith("//")
        ) {
            return (
                window.location.protocol +
                image
            );
        }


        /* Absolute backend path */

        if (
            image.startsWith("/")
        ) {
            return (
                API_URL +
                image
            );
        }


        /* Relative backend path */

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
       EXTRACT BACKEND RESPONSE
    ====================================================== */

    function extractMedia(response) {

        if (
            Array.isArray(response)
        ) {
            return response;
        }


        if (
            response &&
            Array.isArray(response.media)
        ) {
            return response.media;
        }


        if (
            response &&
            Array.isArray(response.data)
        ) {
            return response.data;
        }


        if (
            response &&
            Array.isArray(response.results)
        ) {
            return response.results;
        }


        return [];
    }


    /* =====================================================
       NORMALIZE MEDIA
    ====================================================== */

    function normalizeMediaItem(item) {

        if (
            !item ||
            typeof item !== "object"
        ) {
            return null;
        }

        return {

            id:
                getId(item),

            title:
                getTitle(item),

            description:
                getDescription(item),

            image:
                getImage(item),

            eventType:
                getEventType(item)

        };
    }


    /* =====================================================
       REMOVE DUPLICATES
       
       IMPORTANT FIX:
       
       Previously ID was preferred.
       If backend had:
       
       ID 1 -> same-image.jpg
       ID 2 -> same-image.jpg
       
       both could appear.

       Now IMAGE is the primary duplicate key.
    ====================================================== */

    function removeDuplicateMedia(items) {

        const seenImages =
            new Set();

        const seenIds =
            new Set();

        const unique =
            [];


        items.forEach(item => {

            const image =
                normalizeText(
                    getImageURL(item)
                );

            const title =
                normalizeText(
                    getTitle(item)
                );

            const id =
                normalizeText(
                    getId(item)
                );


            /*
             * If image exists,
             * image is the strongest duplicate key.
             */

            if (image) {

                if (
                    seenImages.has(image)
                ) {
                    return;
                }

                seenImages.add(image);

                unique.push(item);

                return;
            }


            /*
             * If no image exists,
             * fall back to ID.
             */

            if (id) {

                if (
                    seenIds.has(id)
                ) {
                    return;
                }

                seenIds.add(id);

                unique.push(item);

                return;
            }


            /*
             * Last fallback:
             * title.
             */

            const titleKey =
                `title:${title}`;

            if (
                seenIds.has(titleKey)
            ) {
                return;
            }

            seenIds.add(titleKey);

            unique.push(item);

        });


        return unique;
    }


    /* =====================================================
       UI STATES
    ====================================================== */

    function showLoading() {

        mediaLoading?.classList.add(
            "show"
        );

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


    function hideStates() {

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
    ====================================================== */

    async function fetchMedia() {

        if (!API_URL) {

            throw new Error(
                "VITE_API_URL is not configured."
            );
        }


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


        const data =
            await response.json();


        const extracted =
            extractMedia(data);


        const normalized =
            extracted
                .map(normalizeMediaItem)
                .filter(Boolean);


        return removeDuplicateMedia(
            normalized
        );
    }


    /* =====================================================
       GET UNIQUE EVENT TYPES
    ====================================================== */

    function getCategories() {

        const categories = [];

        const seen =
            new Set();


        mediaItems.forEach(item => {

            const eventType =
                getEventType(item);

            if (!eventType) {
                return;
            }


            const key =
                normalizeText(
                    eventType
                );


            if (
                seen.has(key)
            ) {
                return;
            }


            seen.add(key);

            categories.push(
                eventType
            );

        });


        return categories;
    }


    /* =====================================================
       RENDER FILTER BUTTONS
    ====================================================== */

    function renderCategories() {

        if (!mediaCategories) {
            return;
        }


        mediaCategories.innerHTML =
            "";


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
            currentCategory === "all"
        ) {
            allButton.classList.add(
                "active"
            );
        }


        mediaCategories.appendChild(
            allButton
        );


        getCategories()
            .forEach(eventType => {

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
                        eventType
                    );


                button.textContent =
                    eventType;


                if (
                    currentCategory ===
                    normalizeText(eventType)
                ) {

                    button.classList.add(
                        "active"
                    );
                }


                mediaCategories.appendChild(
                    button
                );

            });
    }


    /* =====================================================
       FILTER
    ====================================================== */

    function getFilteredMedia() {

        if (
            currentCategory === "all"
        ) {

            return [
                ...mediaItems
            ];
        }


        return mediaItems.filter(
            item => {

                return (
                    normalizeText(
                        getEventType(item)
                    ) ===
                    currentCategory
                );

            }
        );
    }


    /* =====================================================
       CREATE MEDIA CARD
       
       FINAL DESIGN:

       ┌─────────────────────────────┐
       │  Birthday                   │
       │                             │
       │        BACKEND IMAGE        │
       │                             │
       │ ┌─────────────────────────┐ │
       │ │ Birthday                │ │
       │ │ A special birthday...   │ │
       │ └─────────────────────────┘ │
       └─────────────────────────────┘
    ====================================================== */

    function createMediaCard(
        item,
        index
    ) {

        const image =
            getImageURL(item);

        const title =
            getTitle(item);

        const description =
            getDescription(item);

        const eventType =
            getEventType(item);


        if (!image) {
            return null;
        }


        const card =
            document.createElement(
                "article"
            );


        card.className =
            "media-card";


        /*
         * TOP PILL
         * eventType = Birthday,
         * Anniversary, Wedding etc.
         */

        const typePill =
            eventType
                ? `
                    <span class="media-card-type">
                        ${escapeHTML(eventType)}
                    </span>
                  `
                : "";


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


                ${typePill}


                <div class="media-card-overlay">

                    <div class="media-card-info">

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


        /* =================================================
           IMAGE ERROR HANDLING
        ================================================= */

        const imageElement =
            card.querySelector(
                "img"
            );


        imageElement?.addEventListener(
            "error",
            () => {

                imageElement.classList.add(
                    "image-error"
                );

                imageElement.alt =
                    `${title} - image unavailable`;

            }
        );


        /* =================================================
           OPEN LIGHTBOX
        ================================================= */

        const cardButton =
            card.querySelector(
                ".media-card-button"
            );


        cardButton?.addEventListener(
            "click",
            () => {

                openLightbox(
                    index,
                    filteredMedia
                );

            }
        );


        return card;
    }


    /* =====================================================
       RENDER GALLERY
    ====================================================== */

    function renderGallery() {

        if (!mediaGallery) {
            return;
        }


        /*
         * Clear existing cards.
         * This prevents old cards being appended again.
         */

        mediaGallery.innerHTML =
            "";


        filteredMedia =
            getFilteredMedia();


        /*
         * Only items having image are displayed.
         */

        filteredMedia =
            filteredMedia.filter(
                item => {

                    return Boolean(
                        getImageURL(item)
                    );

                }
            );


        if (
            filteredMedia.length === 0
        ) {

            if (
                mediaItems.length === 0
            ) {

                showEmpty();

            } else {

                hideStates();

                mediaEmpty?.classList.add(
                    "show"
                );
            }

            return;
        }


        hideStates();


        /*
         * IMPORTANT:
         * Every filtered backend item
         * renders exactly once.
         */

        filteredMedia.forEach(
            (item, index) => {

                const card =
                    createMediaCard(
                        item,
                        index
                    );


                if (!card) {
                    return;
                }


                mediaGallery.appendChild(
                    card
                );

            }
        );


        if (
            mediaGallery.children.length === 0
        ) {

            showEmpty();
        }
    }


    /* =====================================================
       CATEGORY EVENTS
    ====================================================== */

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
                        filter => {

                            filter.classList.toggle(
                                "active",
                                filter === button
                            );

                        }
                    );


                renderGallery();

            }
        );
    }


    /* =====================================================
       LIGHTBOX
    ====================================================== */

    function openLightbox(
        index,
        source
    ) {

        lightboxItems =
            Array.isArray(source)
                ? source
                : filteredMedia;


        if (
            lightboxItems.length === 0
        ) {
            return;
        }


        if (
            index < 0 ||
            index >= lightboxItems.length
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


    /* =====================================================
       UPDATE LIGHTBOX
    ====================================================== */

    function updateLightbox() {

        const item =
            lightboxItems[
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

        const eventType =
            getEventType(item);


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
                eventType;
        }


        const multiple =
            lightboxItems.length > 1;


        if (lightboxPrev) {

            lightboxPrev.disabled =
                !multiple;
        }


        if (lightboxNext) {

            lightboxNext.disabled =
                !multiple;
        }
    }


    /* =====================================================
       CLOSE LIGHTBOX
    ====================================================== */

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
            lightboxImage.src = "";
        }
    }


    /* =====================================================
       PREVIOUS
    ====================================================== */

    function showPrevious() {

        if (
            lightboxItems.length <= 1
        ) {
            return;
        }


        currentIndex--;


        if (
            currentIndex < 0
        ) {

            currentIndex =
                lightboxItems.length - 1;
        }


        updateLightbox();
    }


    /* =====================================================
       NEXT
    ====================================================== */

    function showNext() {

        if (
            lightboxItems.length <= 1
        ) {
            return;
        }


        currentIndex++;


        if (
            currentIndex >=
            lightboxItems.length
        ) {

            currentIndex = 0;
        }


        updateLightbox();
    }


    /* =====================================================
       LIGHTBOX EVENTS
    ====================================================== */

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
                    event.key === "Escape"
                ) {

                    closeLightbox();

                } else if (
                    event.key === "ArrowLeft"
                ) {

                    showPrevious();

                } else if (
                    event.key === "ArrowRight"
                ) {

                    showNext();
                }

            }
        );
    }


    /* =====================================================
       MOBILE NAVBAR
    ====================================================== */

    function setupMobileNavbar() {

        if (
            !menuToggle ||
            !navLinks
        ) {
            return;
        }


        menuToggle.addEventListener(
            "click",
            event => {

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


        document.addEventListener(
            "click",
            event => {

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
       LOAD MEDIA
    ====================================================== */

    async function loadMedia() {

        if (isLoading) {
            return;
        }


        isLoading =
            true;


        showLoading();


        try {

            const data =
                await fetchMedia();


            /*
             * Backend is the single source
             * of truth.
             */

            mediaItems =
                data;


            currentCategory =
                "all";


            renderCategories();


            if (
                mediaItems.length === 0
            ) {

                showEmpty();

                return;
            }


            renderGallery();

        } catch (error) {

            console.error(
                "Cold Cafe Media Error:",
                error
            );


            showError();

        } finally {

            isLoading =
                false;
        }
    }


    /* =====================================================
       RETRY
    ====================================================== */

    retryMedia?.addEventListener(
        "click",
        () => {

            loadMedia();

        }
    );


    /* =====================================================
       INITIALIZE
    ====================================================== */

    setupCategoryEvents();

    setupLightboxEvents();

    setupMobileNavbar();

    loadMedia();

});