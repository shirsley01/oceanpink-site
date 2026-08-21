"use strict";

/* =========================================================
   OCEAN PINK — SCRIPT PRINCIPAL
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. MENU DE NAVEGAÇÃO
    ===================================================== */

    const menuButton = document.querySelector(".menu-button");
    const navigation = document.querySelector(".navigation");
    const navigationLinks = document.querySelectorAll(".navigation a");

    function closeMenu() {
        if (!menuButton || !navigation) {
            return;
        }

        menuButton.classList.remove("active");
        navigation.classList.remove("open");
        document.body.classList.remove("menu-open");

        menuButton.setAttribute("aria-expanded", "false");
    }

    if (menuButton && navigation) {

        menuButton.addEventListener("click", () => {

            const menuIsOpen = navigation.classList.toggle("open");

            menuButton.classList.toggle("active", menuIsOpen);
            document.body.classList.toggle("menu-open", menuIsOpen);

            menuButton.setAttribute(
                "aria-expanded",
                String(menuIsOpen)
            );
        });


        navigationLinks.forEach((link) => {

            link.addEventListener("click", () => {
                closeMenu();
            });

        });


        window.addEventListener("resize", () => {

            if (window.innerWidth > 760) {
                closeMenu();
            }

        });

    }


    /* =====================================================
       2. ANO AUTOMÁTICO NO RODAPÉ
    ===================================================== */

    const yearElement = document.querySelector("#current-year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    /* =====================================================
       3. GALERIA AUTOMÁTICA — HOME
    ===================================================== */

    const galleryTrack = document.querySelector(".gallery-track");
    const gallerySlides = document.querySelectorAll(".gallery-slide");

    const previousButton =
        document.querySelector(".gallery-arrow-left");

    const nextButton =
        document.querySelector(".gallery-arrow-right");

    const dotsContainer =
        document.querySelector(".gallery-dots");

    const galleryContainer =
        document.querySelector(".gallery-track-container");


    if (
        galleryTrack &&
        gallerySlides.length > 0 &&
        galleryContainer
    ) {

        let currentIndex = 0;
        let autoPlay = null;


        /* Quantas fotografias aparecem ao mesmo tempo */

        function getVisibleSlides() {

            if (window.innerWidth <= 620) {
                return 1;
            }

            if (window.innerWidth <= 900) {
                return 2;
            }

            return 3;
        }


        /* Última posição possível */

        function getMaximumIndex() {

            return Math.max(
                0,
                gallerySlides.length - getVisibleSlides()
            );
        }


        /* Criar indicadores */

        function createDots() {

            if (!dotsContainer) {
                return;
            }

            dotsContainer.innerHTML = "";

            const totalPositions =
                getMaximumIndex() + 1;


            for (
                let index = 0;
                index < totalPositions;
                index++
            ) {

                const dot =
                    document.createElement("button");

                dot.type = "button";

                dot.classList.add("gallery-dot");

                dot.setAttribute(
                    "aria-label",
                    `Ir para a posição ${index + 1} da galeria`
                );


                if (index === currentIndex) {
                    dot.classList.add("active");
                }


                dot.addEventListener("click", () => {

                    currentIndex = index;

                    updateGallery();
                    restartAutoPlay();

                });


                dotsContainer.appendChild(dot);
            }
        }


        /* Atualizar posição */

        function updateGallery() {

            const visibleSlides =
                getVisibleSlides();

            const gap = 20;

            const containerWidth =
                galleryContainer.offsetWidth;

            const slideWidth =
                (
                    containerWidth -
                    gap * (visibleSlides - 1)
                ) / visibleSlides;

            const movement =
                (slideWidth + gap) * currentIndex;


            galleryTrack.style.transform =
                `translateX(-${movement}px)`;


            if (dotsContainer) {

                const dots =
                    dotsContainer.querySelectorAll(
                        ".gallery-dot"
                    );

                dots.forEach((dot, index) => {

                    dot.classList.toggle(
                        "active",
                        index === currentIndex
                    );

                });

            }

        }


        /* Fotografia seguinte */

        function nextSlide() {

            const maximumIndex =
                getMaximumIndex();

            currentIndex =
                currentIndex >= maximumIndex
                    ? 0
                    : currentIndex + 1;

            updateGallery();
        }


        /* Fotografia anterior */

        function previousSlide() {

            const maximumIndex =
                getMaximumIndex();

            currentIndex =
                currentIndex <= 0
                    ? maximumIndex
                    : currentIndex - 1;

            updateGallery();
        }


        /* Reprodução automática */

        function startAutoPlay() {

            stopAutoPlay();

            autoPlay = window.setInterval(
                nextSlide,
                4000
            );
        }


        function stopAutoPlay() {

            if (autoPlay !== null) {

                window.clearInterval(autoPlay);

                autoPlay = null;
            }

        }


        function restartAutoPlay() {

            stopAutoPlay();
            startAutoPlay();
        }


        /* Setas */

        if (nextButton) {

            nextButton.addEventListener(
                "click",
                () => {

                    nextSlide();
                    restartAutoPlay();

                }
            );

        }


        if (previousButton) {

            previousButton.addEventListener(
                "click",
                () => {

                    previousSlide();
                    restartAutoPlay();

                }
            );

        }


        /* Pausar quando o utilizador passa o rato */

        galleryContainer.addEventListener(
            "mouseenter",
            stopAutoPlay
        );

        galleryContainer.addEventListener(
            "mouseleave",
            startAutoPlay
        );


        /* Recalcular quando muda o tamanho do ecrã */

        window.addEventListener(
            "resize",
            () => {

                const maximumIndex =
                    getMaximumIndex();

                if (currentIndex > maximumIndex) {
                    currentIndex = maximumIndex;
                }

                createDots();
                updateGallery();

            }
        );


        /* Inicialização */

        createDots();
        updateGallery();
        startAutoPlay();

    }


    /* =====================================================
       4. AGENDAMENTO ONLINE
       TEMPORARIAMENTE INDISPONÍVEL
    ===================================================== */

    const bookingLinks =
        document.querySelectorAll(".booking-link");


    bookingLinks.forEach((link) => {

        link.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                window.alert(
                    "O agendamento online estará disponível brevemente."
                );

            }
        );

    });

});