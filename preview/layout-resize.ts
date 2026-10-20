/*
 * iOS Safari (and Android Chrome) fire window `resize` whenever the address bar slides during a
 * touch scroll; only innerHeight changes. Handlers that settle, kill or rebuild animations must not
 * treat that as a layout change, or every scroll gesture snaps entrances and aborts the image flight.
 * Width (rotation, window resize) or the initial containing block height (desktop window height;
 * it ignores the phone address bar) changing is a real layout change.
 */
const layoutSize=()=>innerWidth+'x'+document.documentElement.clientHeight;

export function onLayoutResize(callback:()=>void){
 let size=layoutSize();
 const resized=()=>{const next=layoutSize();if(next===size)return;size=next;callback();};
 addEventListener('resize',resized,{passive:true});
 return()=>removeEventListener('resize',resized);
}
