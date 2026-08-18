/*=========================================
MEDIA GALLERY
=========================================*/

const galleryButtons = document.querySelectorAll(".view-btn");

const lightbox = document.getElementById("lightbox");

const lightboxImage = document.getElementById("lightboxImage");

const lightboxTitle = document.getElementById("lightboxTitle");

const closeButton = document.getElementById("lightboxClose");

const previousButton = document.getElementById("lightboxPrev");

const nextButton = document.getElementById("lightboxNext");


/*=========================================
STORE IMAGES
=========================================*/

const galleryImages = [];

galleryButtons.forEach((button, index) => {

    galleryImages.push({

        image: button.dataset.image,

        title: button.dataset.title

    });

});


let currentImage = 0;


/*=========================================
OPEN LIGHTBOX
=========================================*/

function openLightbox(index){

    currentImage = index;

    lightboxImage.src = galleryImages[currentImage].image;

    lightboxImage.alt = galleryImages[currentImage].title;

    lightboxTitle.textContent = galleryImages[currentImage].title;

    lightbox.classList.add("show");

    document.body.style.overflow = "hidden";

}


/*=========================================
CLOSE LIGHTBOX
=========================================*/

function closeLightbox(){

    lightbox.classList.remove("show");

    document.body.style.overflow = "";

}


/*=========================================
NEXT IMAGE
=========================================*/

function nextImage(){

    currentImage++;

    if(currentImage >= galleryImages.length){

        currentImage = 0;

    }

    lightboxImage.src = galleryImages[currentImage].image;

    lightboxImage.alt = galleryImages[currentImage].title;

    lightboxTitle.textContent = galleryImages[currentImage].title;

}


/*=========================================
PREVIOUS IMAGE
=========================================*/

function previousImage(){

    currentImage--;

    if(currentImage < 0){

        currentImage = galleryImages.length - 1;

    }

    lightboxImage.src = galleryImages[currentImage].image;

    lightboxImage.alt = galleryImages[currentImage].title;

    lightboxTitle.textContent = galleryImages[currentImage].title;

}


/*=========================================
BUTTON EVENTS
=========================================*/

galleryButtons.forEach((button, index) => {

    button.addEventListener("click", function(event){

        event.stopPropagation();

        openLightbox(index);

    });

});


closeButton.addEventListener("click", closeLightbox);

nextButton.addEventListener("click", nextImage);

previousButton.addEventListener("click", previousImage);


/*=========================================
CLICK OUTSIDE IMAGE
=========================================*/

lightbox.addEventListener("click", function(event){

    if(event.target === lightbox){

        closeLightbox();

    }

});


/*=========================================
KEYBOARD CONTROL
=========================================*/

document.addEventListener("keydown", function(event){

    if(!lightbox.classList.contains("show")){

        return;

    }


    if(event.key === "Escape"){

        closeLightbox();

    }


    if(event.key === "ArrowRight"){

        nextImage();

    }


    if(event.key === "ArrowLeft"){

        previousImage();

    }

});