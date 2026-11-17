import {RealtimeClient} from '@supabase/realtime-js';
import {PRESENCE_CHANNEL,SUPABASE_PUBLISHABLE_KEY,SUPABASE_URL} from './config';
import {isExcluded,visitorId} from './identity';

export const realtime=()=>new RealtimeClient(SUPABASE_URL.replace('https','wss')+'/realtime/v1',{params:{apikey:SUPABASE_PUBLISHABLE_KEY,eventsPerSecond:5}});
export const presenceChannel=(client:RealtimeClient,key?:string)=>client.channel(PRESENCE_CHANNEL,{config:{presence:{key:key??''}}});

/** Public-site presence: one websocket per tab, keyed by the anonymous visitor id so tabs of one browser collapse to one visitor. */
export function startPresence(){
  let client:RealtimeClient|null=null,channel:ReturnType<typeof presenceChannel>|null=null,timer:ReturnType<typeof setTimeout>|undefined,path=location.pathname;
  const send=()=>{if(channel)void channel.track({p:path});};
  const connect=()=>{
    if(client||isExcluded())return;
    client=realtime();channel=presenceChannel(client,visitorId());
    // SUBSCRIBED fires again after every reconnect, which re-announces this tab.
    channel.subscribe(status=>{if(status==='SUBSCRIBED')send();});
  };
  const disconnect=()=>{clearTimeout(timer);if(client){void client.disconnect();client=null;channel=null;}};
  connect();
  addEventListener('pagehide',disconnect);
  addEventListener('pageshow',e=>{if(e.persisted)connect();});
  addEventListener('online',()=>{client?.connect();});
  // Exclude toggled in another tab: drop out immediately.
  addEventListener('storage',e=>{if(e.key==='hk_ax'){isExcluded()?disconnect():connect();}});
  return (next:string)=>{path=next;clearTimeout(timer);timer=setTimeout(send,1000);};
}
