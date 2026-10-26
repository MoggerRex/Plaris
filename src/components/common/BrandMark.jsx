import { brandImage } from '../../animations/brandIntro';

export default function BrandMark() {
  return (
    <span className="brand-content">
      <img
        className="brand-symbol"
        src={brandImage}
        alt=""
        width="44"
        height="44"
        decoding="async"
      />
      <span className="brand-name">Plaris</span>
    </span>
  );
}
