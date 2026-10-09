'use client';
import {useEffect,useState} from 'react';
import {Moon,Sun} from 'lucide-react';
import {resolveTheme,THEME_KEY} from './theme.mjs';
export default function ThemeToggle(){
 const [theme,setTheme]=useState('light');
 useEffect(()=>{
  let saved:string|null=null;try{saved=localStorage.getItem(THEME_KEY);}catch{}
  const media=window.matchMedia('(prefers-color-scheme: dark)');
  const apply=(value:string)=>{document.documentElement.dataset.theme=value;document.documentElement.style.colorScheme=value;setTheme(value);};
  apply(resolveTheme(saved,media.matches));
  const listener=()=>{if(!saved)apply(resolveTheme(null,media.matches));};media.addEventListener('change',listener);
  const storage=(event:StorageEvent)=>{if(event.key===THEME_KEY){saved=event.newValue==='light'||event.newValue==='dark'?event.newValue:null;apply(resolveTheme(saved,media.matches));}};
  window.addEventListener('storage',storage);return()=>{media.removeEventListener('change',listener);window.removeEventListener('storage',storage);};
 },[]);
 function toggle(){const next=theme==='dark'?'light':'dark';try{localStorage.setItem(THEME_KEY,next);}catch{}document.documentElement.dataset.theme=next;document.documentElement.style.colorScheme=next;setTheme(next);window.dispatchEvent(new StorageEvent('storage',{key:THEME_KEY,newValue:next}));}
 return <button className="theme-toggle" type="button" aria-label={`Switch to ${theme==='dark'?'light':'dark'} theme`} aria-pressed={theme==='dark'} onClick={toggle}>{theme==='dark'?<Sun size={17}/>:<Moon size={17}/>}<span>{theme==='dark'?'Light':'Dark'}</span></button>;
}
