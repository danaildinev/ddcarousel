# Changelog

## v1.3 (2020 Sept 7)
-   Added option to reinitialize carousel
-   Added option to destroy carousel (revert container to state before initialization or fully wipe it)
-   Added new destroy events
-   Added new option for vertical orientation that changes the width of the carousel relative to the longest slide inside
-   Changed navigation buttons content
-   You can now create an instance of carousel with empty config and initialize it later
-   You can now use carousel as module 
-   Fixed crash when container is empty
-   Fixed changing slides when set items to zero - now allows to show every items next each other
-   Fixed carousel crash when trying to change page with negative index
-   Fixed security vulnerability
-   Much smaller filesize due to changes in code structure
-   Code and project improvements
-   Updated packages
-   Improved and added new demos

## v1.2.1 (2020 Apr 15)
-   Improved auto height option
-   Auto height is now enabled by default and slider width is set to auto (if you disable auto height, you must to specify manually the height)
-   Fixed error when slider items are lower count than specified in the config
-   Improved navigation and dots - they won't show when there aren't any pages to slide
-   Pointer events are enabled only when mouse drag is enabled
-   Mouse drag is disabled by default

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