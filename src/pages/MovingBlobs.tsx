import { useEffect, useRef, useState } from "react";
import styles from "@/styles/Home.module.css";

type blobProps = {
  id: string,
  x: number, 
  y: number, 
  angle: number, 
  speed: number,
  color: string, 
  width: number, 
  height: number,
  svgSize: {width: number, height: number}
};
export default function MovingBlobs({id, x, y, angle, speed, color, width, height, svgSize}: blobProps) {

  const [blobState, setBlobState] = useState({x: x, y: y, angle: angle});

  const requestRef = useRef<number | undefined>();
  const previousTimeRef = useRef(0);
  
  const animate = useRef((time: number) => {
    if (previousTimeRef.current != undefined) {
      
      setBlobState((prevCount: { angle: number; x: number; y: number; }) => {
        const deltaTime = time - previousTimeRef.current;
        let newAngle = prevCount.angle + (Math.round(Math.random()) === 1 ? 1 : -1) * deltaTime * Math.PI / 2;
        // Bounds
        if(prevCount.x > svgSize.width || prevCount.y > svgSize.height || prevCount.x < -width || prevCount.y < -height)
          newAngle += Math.PI;
        // New position
        const newX = prevCount.x + Math.cos(newAngle) * speed;
        const newY = prevCount.y + Math.sin(newAngle) * speed;
        
        return {
          angle: newAngle, 
          x: newX, 
          y: newY
        };
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate.current);
  });
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate.current);
    return () => {
      if(requestRef.current) 
        cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (<g>
    <defs>
      <radialGradient id={id}>
        <stop offset="0%" stopColor={color} />
        <stop offset="95%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <rect
      className={styles.rect}
      fill={`url(#${id})`}
      x={blobState.x} y={blobState.y}
      width={width} height={height}
    />
  </g>);
}