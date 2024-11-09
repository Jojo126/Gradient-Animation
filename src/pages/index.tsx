import Head from "next/head";
import Image from "next/image";
import localFont from "next/font/local";
import styles from "@/styles/Home.module.css";
import { useEffect, useState, useRef } from "react";
import jpLogo from '../../public/logo.svg';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

type color = {
  r: number, 
  g: number, 
  b: number
};
type gradientStop = {
  offset: number, 
  minOffset: number,
  maxOffset: number,
  lastTurn: number, 
  dir: number,
  color: color
};
type coords = {
  blob1: {x: number, y: number, angle: number},
  blob2: {x: number, y: number, angle: number},
  stop1: gradientStop,
  stop2: gradientStop,
  stop3: gradientStop
};

type size = {
  width: number, 
  height: number
}
const blob1Size: size = {width: 500, height: 250};
const blob2Size: size = {width: 750, height: 500};

export default function Home() {
  // använd dir för att räkna ut nästa flytt och tillåt bara förändring x grader från tidigare för att få den mer kontinuerlig?
  // spara ner senaste vändning och tillåt inte ny om för kort tid sen senast, för offsets
  const [x, setCount]: [coords, Function] = useState({
    blob1: {x: -160, y: -120, angle: -Math.PI/4},
    blob2: {x: 430, y: 50, angle: Math.PI},
    stop1: {offset: 25, minOffset: 0, maxOffset: 50, lastTurn: 0, dir: 1, color: {r: 255, g: 0, b: 255}},
    stop2: {offset: 60, minOffset: 25, maxOffset: 80, lastTurn: 0, dir: 1, color: {r: 0, g: 255, b: 255}},
    stop3: {offset: 120, minOffset: 90, maxOffset: 130, lastTurn: 0, dir: 1, color: {r: 0, g: 0, b: 255}}
  });
  const minOffsetMargin = 20;
  const speed = 0.002;
  
  // Use useRef for mutable variables that we want to persist
  // without triggering a re-render on their change
  const requestRef: any = useRef();
  const previousTimeRef = useRef(0);
  
  const animate = (time: number) => {
    if (previousTimeRef.current != undefined) {
      const deltaTime = time - previousTimeRef.current;
      
      // Pass on a function to the setter of the state
      // to make sure we always have the latest state
      const getNew = (angle: number) => angle + speed*5 * (Math.round(Math.random()) === 1 ? 1 : -1);

      const getNewOffsets = (prevCount: coords) => {
        
        if(prevCount.stop1.lastTurn + 5000 < time) {
          prevCount.stop1.lastTurn = time;
          if(Math.random() < .9) {
            // console.log('switching dir', prevCount.stop1);
            
            prevCount.stop1.dir *= -1;
          }
        }
        prevCount.stop1.offset = prevCount.stop1.offset + prevCount.stop1.dir * deltaTime * speed;

        let reachedMin = prevCount.stop1.offset < prevCount.stop1.minOffset;
        let reachedMax = prevCount.stop1.offset > prevCount.stop1.maxOffset;
        let tooCloseToOther = prevCount.stop1.offset + minOffsetMargin > prevCount.stop2.offset;
        if(reachedMax || reachedMin || tooCloseToOther) {
          // console.log('switching dir because constraints', reachedMax, reachedMin, tooCloseToOther, prevCount.stop1);
          prevCount.stop1.dir *= -1;
          prevCount.stop1.offset = prevCount.stop1.offset + prevCount.stop1.dir * deltaTime * speed;
        }


        if(prevCount.stop2.lastTurn + 5000 < time) {
          prevCount.stop2.lastTurn = time;
          if(Math.random() < .9) {
            // console.log('switching dir', prevCount.stop2);
            
            prevCount.stop2.dir *= -1;
          }
        }
        prevCount.stop2.offset = prevCount.stop2.offset + prevCount.stop2.dir * deltaTime * speed;

        reachedMin = prevCount.stop2.offset < prevCount.stop2.minOffset;
        reachedMax = prevCount.stop2.offset > prevCount.stop2.maxOffset;
        tooCloseToOther = prevCount.stop2.offset + minOffsetMargin > prevCount.stop3.offset || prevCount.stop2.offset - minOffsetMargin < prevCount.stop1.offset;
        if(reachedMax || reachedMin || tooCloseToOther) {
          // console.log('switching dir because constraints', reachedMax, reachedMin, tooCloseToOther, prevCount.stop2);
          prevCount.stop2.dir *= -1;
          prevCount.stop2.offset = prevCount.stop2.offset + prevCount.stop2.dir * deltaTime * speed;
        }


        if(prevCount.stop3.lastTurn + 5000 < time) {
          prevCount.stop3.lastTurn = time;
          if(Math.random() < .9) {
            // console.log('switching dir', prevCount.stop3);
            
            prevCount.stop3.dir *= -1;
          }
        }
        prevCount.stop3.offset = prevCount.stop3.offset + prevCount.stop3.dir * deltaTime * speed;

        reachedMin = prevCount.stop3.offset < prevCount.stop3.minOffset;
        reachedMax = prevCount.stop3.offset > prevCount.stop3.maxOffset;
        tooCloseToOther = prevCount.stop3.offset - minOffsetMargin < prevCount.stop2.offset;
        if(reachedMax || reachedMin || tooCloseToOther) {
          // console.log('switching dir because constraints', reachedMax, reachedMin, tooCloseToOther, prevCount.stop3);
          prevCount.stop3.dir *= -1;
          prevCount.stop3.offset = prevCount.stop3.offset + prevCount.stop3.dir * deltaTime * speed;
        }

        return prevCount;
      };
      
      setCount((prevCount: coords) => {
        const newOffsets = getNewOffsets(prevCount);
        newOffsets.blob1.angle = getNew(prevCount.blob1.angle);
        if(newOffsets.blob1.x > 840 || newOffsets.blob1.y > 200 || newOffsets.blob1.x < -blob1Size.width || newOffsets.blob1.y < -blob1Size.height)
          newOffsets.blob1.angle += Math.PI;
        newOffsets.blob2.angle = getNew(prevCount.blob2.angle);
        if(newOffsets.blob2.x > 840 || newOffsets.blob2.y > 200 || newOffsets.blob2.x < -blob2Size.width || newOffsets.blob2.y < -blob2Size.height)
          newOffsets.blob2.angle += Math.PI;
        
        newOffsets.blob1.x = prevCount.blob1.x + Math.cos(newOffsets.blob1.angle);
        newOffsets.blob2.x = prevCount.blob2.x + Math.cos(newOffsets.blob2.angle);
        newOffsets.blob1.y = prevCount.blob1.y + Math.sin(newOffsets.blob1.angle);
        newOffsets.blob2.y = prevCount.blob2.y + Math.sin(newOffsets.blob2.angle);
        // console.log(newOffsets.blob1.angle);
        
        return structuredClone(newOffsets);
      });
    }
    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }
  
  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []); // Make sure the effect runs only once

  return (
    <>
      <Head>
        <title>Text Gradient Animation</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&family=Space+Mono&display=swap" rel="stylesheet"></link>
      </Head>
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <svg viewBox="0 0 840 202" style={{ width: '90%', maxHeight: '100%', maxWidth: '80rem' }}>
            <defs>
              <linearGradient id="Gradient1" gradientTransform="rotate(30)" spreadMethod="reflect">
                <stop style={{
                  stopColor: `rgb(${x.stop1.color.r},${x.stop1.color.g},${x.stop1.color.b})`
                }} offset={x.stop1.offset +'%'} />
                <stop style={{
                  stopColor: `rgb(${x.stop2.color.r},${x.stop2.color.g},${x.stop2.color.b})`
                }} offset={x.stop2.offset +'%'} />
                <stop style={{
                  stopColor: `rgb(${x.stop3.color.r},${x.stop3.color.g},${x.stop3.color.b})`
                }} offset={x.stop3.offset +'%'} />
              </linearGradient>
              <radialGradient id="myGradient">
                <stop offset="10%" stopColor="red" />
                <stop offset="95%" stopColor="transparent" />
              </radialGradient>
              <radialGradient id="red">
                <stop offset="10%" stopColor="yellow" />
                <stop offset="95%" stopColor="transparent" />
              </radialGradient>
              
              <mask id="mask1">
                {<g id="Layer_2">
                  <path fill="#FFF" d="M178.2,15.5C165.5,6.1,149.6,0,131.2,0H0v20h90v121l0,0c0,22-15.5,40.3-34.3,40.6 C35.8,181.3,20.3,163,20.3,141H0.2c0,32,23.8,59.8,55.8,60.4v0c0,0,0.3,0,0.5,0c0.2,0-0.5,0,0.5,0v0c29-0.6,52.5-27.4,53-59.4l0,0 v-31.9l21-0.3c18.4-0.4,34.5-5.8,47.1-15.2c14-10.4,21.9-23.9,21.9-39.8C200.1,39.9,192.1,25.8,178.2,15.5z M129,90L129,90h-19 V20.1l19,0.2c28.3,0,50.8,15.6,50.8,34.4C179.8,74.6,154.7,90,129,90z"></path>
                </g>}
                <text x="220" y="90" fill="white" style={{
                  font: 'bold 120px Montserrat'
                }}>Johanna</text>
                <text x="210" y="200" fill="white" style={{
                  font: 'bold 120px Montserrat'
                }}>Palmkvist</text>
              </mask>
            </defs>
            
            <rect 
              id="rect1" 
              fill="url(#Gradient1)"
              x="0" y="0"
              width="830" height="202"
              mask="url(#mask1)" 
               />
            <rect 
              id="rect1" 
              fill="url(#myGradient)"
              x={x.blob1.x} y={x.blob1.y}
              width={blob1Size.width} height={blob1Size.height}
              mask="url(#mask1)"
              style={{mixBlendMode: 'color'}}
              />
            <rect 
              id="rect1"
              fill="url(#red)"
              x={x.blob2.x} y={x.blob2.y}
              width={blob2Size.width} height={blob2Size.height}
              mask="url(#mask1)"
              style={{mixBlendMode: 'color'}}
               />
        </svg>
      </div>
    </>
  );
}
