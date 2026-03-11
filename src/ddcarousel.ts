import "./ddcarousel.scss";
import Carousel from "./core/carousel";

export default function ddcarousel(config: {}) {
    return new Carousel(config);
}