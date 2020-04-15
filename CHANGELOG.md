# Changelog

## v1.2.1 (2020 Apr 15)
-   Improved auto height option
-   Fixed error when slider items are lower count than specified in the config
-   Navigation and dots won't show when there aren't any pages to slide

## v1.2 (2019 Nov 15)
-   Added full width option
-   Added option to show specified page number after init
-   Added autoplay option with options for speed, pause on hover/touch and methods for start/stop
-   Added option to toggle callback events (disabled by default)
-   Added option to control refresh speed of carousel when resizing the window
-   Reworked responsive option - you can specify set of options for different viewports
-   Improved events and resizing performance
-   Breaking changes in this version:
    -   'itemsPerPage' option is renamed to 'items'
    -   'responsive' option is renamed to 'fullWidth'
    -   'touch' option is renamed to 'touchDrag'
    -   'touchMouse' option is renamed to 'mouseDrag'
    -   'calculateStage()' method is replaced with 'refresh()'
    -   'urlNav' will no longer enable automatically 'itemPerPage'

## v1.1 (2019 Oct 15)
-   Added new vertical orientation feature
-   Added centered slide option
-   Added new url navigation
-   Added option to scroll one slide per page 
-   Added pages
-   Reworked and added 4 new events with callback and another way to listen 
-   Improved carousel swiping
-   Improved swiping easing
-   Improved compatibility with older browsers
-   ... and many small fixed bugs from previous version and code improvements to keep app relatively light

## v1.0.2 (2019 Sept 12)

-   Added Safari 8 support
-   Fixed getCurrentPage() method
-   Fixed stage selection with mouse when swiping the carousel on older Firefox versions
-   (Dev) Switched to SCSS style and added new build scripts

## v1.0.1 (2019 Sept 12)

-   Added IE10 support
-   Fixed stage subpixel problem between slides when scrolling
-   Fixed IE11 isInteger bug
-   Fixed IE11 demo
-   Fixed autoheight bug
-   Disabled text selection when swiping
-   (Dev) Code and babel optimizations

## v1.0.0 (2019 Sept 10)

-   Initial version.