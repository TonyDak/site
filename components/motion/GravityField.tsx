"use client";
import { useEffect, useRef } from "react";
type Particle = { x:number; y:number; vx:number; vy:number; radius:number; alpha:number };
export function GravityField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas=canvasRef.current; if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context=canvas.getContext("2d"); if (!context) return; const pointer={x:-9999,y:-9999}; let particles:Particle[]=[]; let frame=0;
    const resize=()=>{const ratio=Math.min(window.devicePixelRatio||1,2); canvas.width=window.innerWidth*ratio; canvas.height=window.innerHeight*ratio; canvas.style.width=`${window.innerWidth}px`; canvas.style.height=`${window.innerHeight}px`; context.setTransform(ratio,0,0,ratio,0,0); particles=Array.from({length:window.innerWidth<720?38:78},()=>({x:Math.random()*window.innerWidth,y:Math.random()*window.innerHeight,vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,radius:Math.random()*1.7+1,alpha:Math.random()*.32+.16}));};
    const move=(event:PointerEvent)=>{pointer.x=event.clientX;pointer.y=event.clientY;}; const clear=()=>{pointer.x=-9999;pointer.y=-9999;};
    const draw=()=>{context.clearRect(0,0,window.innerWidth,window.innerHeight); for(const p of particles){const dx=pointer.x-p.x,dy=pointer.y-p.y,distance=Math.hypot(dx,dy); if(distance<230){const pull=(1-distance/230)*.19;p.vx+=(dx/Math.max(distance,1))*pull;p.vy+=(dy/Math.max(distance,1))*pull;} p.vx*=.982;p.vy*=.982;p.x+=p.vx;p.y+=p.vy;if(p.x<-10||p.x>window.innerWidth+10||p.y<-10||p.y>window.innerHeight+10){p.x=Math.random()*window.innerWidth;p.y=Math.random()*window.innerHeight;}context.beginPath();context.fillStyle=`rgba(88,81,219,${p.alpha})`;context.arc(p.x,p.y,p.radius,0,Math.PI*2);context.fill();}frame=requestAnimationFrame(draw);};
    resize();draw();window.addEventListener("resize",resize,{passive:true});window.addEventListener("pointermove",move,{passive:true});window.addEventListener("blur",clear);return()=>{cancelAnimationFrame(frame);window.removeEventListener("resize",resize);window.removeEventListener("pointermove",move);window.removeEventListener("blur",clear);};
  },[]);
  return <canvas ref={canvasRef} className="c--gravity-field" aria-hidden="true"/>;
}
