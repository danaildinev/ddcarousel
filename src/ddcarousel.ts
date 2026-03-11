import "./ddcarousel.scss";
import Carousel from "./core/carousel";
import type { CarouselConfig } from "./types/carousel.config";

export default function ddcarousel(config: CarouselConfig) {
    return new Carousel(config);
}