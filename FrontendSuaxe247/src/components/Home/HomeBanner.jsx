import { useState } from "react";
import "./HomeBanner.css";

export default function BannerSlider() {
  const images = ["/assets/banner4.png", "/assets/banner2.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;
    setDirection("next");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setIsAnimating(false);
    }, 500);
  };

  const handlePrev = () => {
    if (isAnimating) return;
    setDirection("prev");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setIsAnimating(false);
    }, 500);
  };

  return (
    <div
      className="position-relative overflow-hidden"
      style={{ maxHeight: "500px" }}
    >
      <div
        className={`banner-slide ${direction} ${
          isAnimating ? "animating" : ""
        }`}
      >
        <img
          src={images[currentIndex]}
          alt="Banner"
          className="w-100 h-100 object-fit-cover rounded shadow"
          style={{ maxHeight: "500px" }}
        />
      </div>

      {/* Nút trái */}
      <button
        onClick={handlePrev}
        className="btn d-flex align-items-center justify-content-center position-absolute top-50 start-0 translate-middle-y ms-3"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid #fff",
          backgroundColor: "rgba(0,0,0,0)",
          color: "#fff",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        ‹
      </button>

      {/* Nút phải */}
      <button
        onClick={handleNext}
        className="btn d-flex align-items-center justify-content-center position-absolute top-50 end-0 translate-middle-y me-3"
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "50%",
          border: "2px solid #fff",
          backgroundColor: "rgba(0, 0, 0, 0)",
          color: "#fff",
          fontSize: "20px",
          fontWeight: "bold",
        }}
      >
        ›
      </button>

      {/* Indicator (các nút tròn nhỏ) */}
      <div
        className="d-flex justify-content-center position-absolute bottom-0 start-50 translate-middle-x mb-3"
      >
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              margin: "0 5px",
              border: "none",
              backgroundColor:
                currentIndex === index ? "#fff" : "rgba(255,255,255,0.5)",
              cursor: "pointer",
            }}
          ></button>
        ))}
      </div>
    </div>
  );
}
