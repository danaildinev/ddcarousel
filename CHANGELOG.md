# Changelog

## v1.4.1 (2026 February 12)
- Bump version for npm re-publish

## v1.4 (2026 February 10)
- Added an option to enable lazy loading for images in slides
- Added an option to preload images in upcoming slides and an option to change the number of upcoming slides
- Added an option to pause autoplay when the tab is hidden to prevent background playback
- Added an option to show autoplay progress bar
- Added an option to navigate slides using the keyboard
- Fix autoplay repeatedly trying to go to the next page when already on the last page
- Fix autoplay not reseting timer when changing pages
- Changed default autoplay speed to 5 seconds
- Exposed more properties to `getStatus()` methods: current page, total pages, total slides, current active slides, current translate and current config
- Configure Babel preset-env to use Browserslist targets
- Updated generated header information for distribution files
- Updated some npm packages to latest versions
- Removed deprecated npm packages

## v1.3.1 (2021 March 31)
-   Updated 'y18n' package to latest version to fix a security vulnerability
-   Updated all packages to latest version

## v1.3 (2020 Sept 7)
-   Added new method to reinitialize carousel
-   Added new method to destroy carousel (revert container to state before initialization or fully wipe it)
-   Added new method to show carousel info
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
-   Breaking changes in this version:
    - `DDCarousel()` is now `ddcarousel()`

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
    -   `itemsPerPage` option is renamed to `items`
    -   `responsive` option is renamed to `fullWidth`
    -   `touch` option is renamed to `touchDrag`
    -   `touchMouse` option is renamed to `mouseDrag`
    -   `calculateStage()` method is replaced with `refresh()`
    -   `urlNav` will no longer enable automatically `itemPerPage`

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
-   Fixed `getCurrentPage()` method
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