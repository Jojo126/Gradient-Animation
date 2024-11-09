import { useEffect, useState, useRef } from "react";
import { gradientStop } from "@/types/gradientStop";

type dimensions = {
  width: number, 
  height: number
};
export default function LinearGradient({initStops, speed, svgSize}: {initStops: gradientStop[], speed: number, svgSize: dimensions}) {
  const [stops, setStops] = useState(initStops);
  const minOffsetMargin = 30;
  
  const requestRef = useRef<number | undefined>();
  const previousTimeRef = useRef(0);
  
  const animate = useRef((time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      const getNewOffset = (stop: gradientStop, leftStopOffset?: number, rightStopOffset?: number): gradientStop => {
        
        if(stop.lastTurn + 5000 < time) {
          stop.lastTurn = time;
          if(Math.random() < .9) {
            stop.dir *= -1;
          }
        }
        stop.offset = stop.offset + stop.dir * deltaTime * speed;

        const reachedMin = stop.offset < stop.minOffset;
        const reachedMax = stop.offset > stop.maxOffset;
        const tooCloseToOther = 
          (rightStopOffset ? stop.offset + minOffsetMargin > rightStopOffset : false) || 
          (leftStopOffset ? stop.offset - minOffsetMargin < leftStopOffset : false);
        if(reachedMax || reachedMin || tooCloseToOther) {
          stop.dir *= -1;
          stop.offset = stop.offset + stop.dir * deltaTime * speed;
        }

        return stop;
      };
      
      setStops((prevStops: gradientStop[]) => {
        const newOffsets = [];
        for(let i = 0; i < prevStops.length; i++) {
          newOffsets.push(getNewOffset(prevStops[i], prevStops[i-1]?.offset, prevStops[i+1]?.offset));
        }
        
        return newOffsets;
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

  return (
    <g>
      <defs>
        <linearGradient id="linearGradient" gradientTransform="translate(.1, 0) rotate(30)">
          {stops?.map((stop, id) => <stop key={id} style={{ stopColor: stop.color }} offset={stop.offset +'%'} />)}
        </linearGradient>
      </defs>
      <rect 
        id="rect1" 
        fill="url(#linearGradient)"
        x="0" y="0"
        width={svgSize?.width} height={svgSize?.height}
      />
    </g>
  );
}