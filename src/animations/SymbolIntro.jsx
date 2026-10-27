import { useEffect, useRef, useState } from 'react';
import { brandImage, playBrandIntro } from './brandIntro';
import './symbol-intro.css';

export default function SymbolIntro({
  rootRef,
  readyRef,
  src = brandImage,
  background = '#ffffff',
}) {
  const [finished, setFinished] = useState(false);
  const overlayRef = useRef(null);
  const backdropRef = useRef(null);
  const logoRef = useRef(null);

  useEffect(() => {
    if (finished) return;
    return playBrandIntro({
      target: rootRef.current?.querySelector('.phi-logo'),
      logo: logoRef.current,
      backdrop: backdropRef.current,
      overlay: overlayRef.current,
      onFinish: () => setFinished(true),
      isReady: () => readyRef?.current ?? true,
    });
  }, [rootRef, readyRef, src, finished]);

  if (finished) return null;
  return (
    <div ref={overlayRef} className="symbol-intro" aria-hidden="true">
      <div ref={backdropRef} className="symbol-intro-backdrop" style={{ background }} />
      <img ref={logoRef} src={src} alt="" className="symbol-intro-mark" draggable={false} />
    </div>
  );
}
