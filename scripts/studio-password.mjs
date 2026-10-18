// Owner tool: creates the Studio admin credentials. Nothing is written to disk or sent anywhere;
// copy the printed values into the server-only environment (.env.local / Vercel), never into VITE_ vars.
//   npm run studio:password                 hash a new admin password (asked twice, hidden)
//   npm run studio:password -- --session    also print a new ADMIN_SESSION_SECRET
//   npm run studio:password -- --totp       also print a new ADMIN_TOTP_SECRET + authenticator URI
import {randomBytes} from 'node:crypto';
import readline from 'node:readline';
import {hashPassword,passwordProblems,base32Encode} from '../server/studio/auth.ts';

const args=new Set(process.argv.slice(2));
async function ask(question){
 if(!process.stdin.isTTY){const lines=[];for await(const line of readline.createInterface({input:process.stdin}))lines.push(line);return lines;}
 const rl=readline.createInterface({input:process.stdin,output:process.stdout,terminal:true});
 let muted=false;rl._writeToOutput=text=>{if(!muted||text.includes(question))process.stdout.write(muted?question:text);};
 const one=prompt=>new Promise(resolve=>{muted=false;process.stdout.write('');rl.question(prompt,answer=>{process.stdout.write('\n');resolve(answer);});muted=true;});
 const first=await one(question),second=await one('Repeat: ');rl.close();return [first,second];
}
const [password,repeat=password]=await ask('New Studio admin password: ');
if(!password||password!==repeat){console.error('The passwords do not match.');process.exit(1);}
const problems=passwordProblems(password);
if(problems.length){console.error('Password refused:\n- '+problems.join('\n- '));process.exit(1);}
console.log('\nServer-only environment values (keep them secret):\n');
console.log('ADMIN_PASSWORD_HASH='+hashPassword(password));
if(args.has('--session'))console.log('ADMIN_SESSION_SECRET='+randomBytes(32).toString('base64url'));
if(args.has('--totp')){const secret=base32Encode(randomBytes(20));console.log('ADMIN_TOTP_SECRET='+secret);console.log('\nAdd to an authenticator app (scan as text or enter the secret manually):\notpauth://totp/Hashem%20Kayyali%20Studio?secret='+secret+'&issuer=hashemkayyali.com&algorithm=SHA1&digits=6&period=30');}
console.log('\nRemove any old ADMIN_PASSWORD variable. Changing the hash or session secret signs out every session.');
