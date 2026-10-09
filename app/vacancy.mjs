export const MAX_PAGE_BYTES=1024*1024;
export const EXTRACTION_FALLBACK='This page could not be read as a public vacancy. Paste its job description below, then choose Extract pasted description.';
export function publicVacancyUrl(value) {
 if(typeof value!=='string'||value.length>2000)throw new Error('Enter a public vacancy URL.');
 let url;try{url=new URL(value);}catch{throw new Error('Enter a valid HTTP or HTTPS vacancy URL.');}
 const host=url.hostname.toLowerCase();
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password||url.port&&!['80','443'].includes(url.port)||host.includes(':')||!host.includes('.')||!/[a-z]/i.test(host)||!/^[a-z0-9.-]+$/.test(host)||host.split('.').some(part=>!part||part.startsWith('-')||part.endsWith('-'))||/\.(?:localhost|local|internal|lan|home|test|invalid|example|onion|arpa)$/.test(host)||host==='localhost'||host.endsWith('.localhost')||/^\d+\.\d+\.\d+\.\d+$/.test(host))throw new Error('Use a public website hostname without credentials or private network addresses.');
 url.hash='';return url;
}
export function parseJobShare(value) {
 if(typeof value!=='string'||!value.trim()||value.length>3000)throw new Error('Paste one public vacancy URL, optionally preceded by its job title.');
 const text=value.trim(),matches=[...text.matchAll(/https?:\/\/[^\s<>"']+/gi)];
 if(matches.length!==1)throw new Error('Paste exactly one public vacancy URL.');
 const match=matches[0],before=text.slice(0,match.index).trim(),after=text.slice(match.index+match[0].length).trim();
 if(after||before.length>200||before.split(/\r?\n/).filter(line=>line.trim()).length>1)throw new Error('Paste one short job title followed by one vacancy URL.');
 return {url:publicVacancyUrl(match[0]).href,title:before};
}
export function publicAddress(address) {
 if(typeof address!=='string')return false;
 if(address.includes(':')) {
  const a=address.toLowerCase();
  // Only global-unicast IPv6; reject mapped IPv4, unique-local, loopback, link-local and transition/documentation ranges.
  return /^[23][0-9a-f]{3}:/.test(a)&&!/^2001:(?:0*:|db8:|10:|20:|2:)/.test(a)&&!/^2002:|^3fff:/.test(a)&&!a.includes('.');
 }
 const parts=address.split('.');if(parts.length!==4||parts.some(x=>!/^\d{1,3}$/.test(x)||Number(x)>255))return false;
 const [a,b,c]=parts.map(Number);
 return !(a===0||a===10||a===127||a>=224||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===2)||a===100&&b>=64&&b<=127||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);
}
export async function boundedText(response,max=MAX_PAGE_BYTES) {
 if(Number(response.headers.get('content-length'))>max)throw new Error('The page is too large. Paste the job description instead.');
 if(!response.body)return '';
 const reader=response.body.getReader();let size=0;const chunks=[];
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>max)throw new Error('The page is too large. Paste the job description instead.');chunks.push(value);}}catch(e){await reader.cancel().catch(()=>{});throw e;}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}return new TextDecoder().decode(bytes);
}
async function checkDns(host,fetcher,signal) {
 const responses=await Promise.all(['A','AAAA'].map(async type=>{
  const response=await fetcher(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(host)}&type=${type}`,{headers:{Accept:'application/dns-json'},signal,redirect:'manual'});
  if(!response.ok)throw new Error('The website address could not be verified. Paste the description instead.');
  const data=JSON.parse(await boundedText(response,32000));
  if(data.Status!==0)throw new Error('The website address could not be verified.');
  return (data.Answer??[]).filter(item=>item.type===1||item.type===28).map(item=>item.data);
 }));
 const addresses=responses.flat();if(!addresses.length||addresses.some(address=>!publicAddress(address)))throw new Error('Private or unverifiable website addresses are not supported.');
}
export async function fetchVacancy(value,fetcher=fetch,timeoutMs=12000) {
 let url=publicVacancyUrl(parseJobShare(value).url);const sourceUrl=url.href;const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
 try {
  for(let redirects=0;redirects<=3;redirects++) {
   await checkDns(url.hostname,fetcher,controller.signal);
   const response=await fetcher(url.href,{redirect:'manual',signal:controller.signal,headers:{Accept:'text/html,application/ld+json,application/json;q=0.8','User-Agent':'CareerDesk-VacancyReader/1.0'}});
   if([301,302,303,307,308].includes(response.status)){const location=response.headers.get('location');await response.body?.cancel();if(!location||redirects===3)throw new Error(`Too many redirects. ${EXTRACTION_FALLBACK}`);url=publicVacancyUrl(new URL(location,url).href);continue;}
   if(!response.ok){await response.body?.cancel();throw new Error(`The website returned ${response.status}. ${EXTRACTION_FALLBACK}`);}
   const type=response.headers.get('content-type')??'';if(!/text\/html|application\/(?:ld\+)?json|application\/xhtml\+xml/i.test(type))throw new Error(`This link is not an HTML vacancy page. ${EXTRACTION_FALLBACK}`);
   const content=await boundedText(response);const extracted=parseVacancy(content,type.includes('json')?'json':'html');
   if(!extracted.description||extracted.description.length<100)throw new Error(EXTRACTION_FALLBACK);
   return {...extracted,sourceUrl,finalUrl:url.href};
  }
  throw new Error(EXTRACTION_FALLBACK);
 }catch(e){if(controller.signal.aborted)throw new Error(`Reading the page timed out. ${EXTRACTION_FALLBACK}`);throw e;}finally{clearTimeout(timer);}
}
function decode(value) {
 const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',ndash:'–',mdash:'—',bull:'•',auml:'ä',ouml:'ö',uuml:'ü',Auml:'Ä',Ouml:'Ö',Uuml:'Ü',szlig:'ß'};
 return String(value).replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi,(all,key)=>{if(key[0]==='#'){const code=key[1].toLowerCase()==='x'?parseInt(key.slice(2),16):parseInt(key.slice(1),10);return code>0&&code<=0x10ffff?String.fromCodePoint(code):'';}return entities[key]??all;});
}
// A bounded, inert token reader: no DOM, script evaluation or external resources.
// Scans forward once rather than retrying large unclosed-tag regular expressions.
function htmlTokens(value) {
 const source=String(value),lower=source.toLowerCase(),tokens=[];let cursor=0;
 while(cursor<source.length){if(tokens.length>50000)throw new Error('This page is too complex. Paste the job description instead.');const start=source.indexOf('<',cursor);if(start<0){tokens.push({text:source.slice(cursor)});break;}if(start>cursor)tokens.push({text:source.slice(cursor,start)});
  if(source.startsWith('<!--',start)){const end=source.indexOf('-->',start+4);cursor=end<0?source.length:end+3;continue;}
  const end=source.indexOf('>',start+1);if(end<0){tokens.push({text:source.slice(start)});break;}const raw=source.slice(start+1,end);const match=raw.match(/^\s*(\/)?\s*([a-z][a-z0-9:-]*)/i);cursor=end+1;if(!match)continue;const name=match[2].toLowerCase(),close=Boolean(match[1]);
  if(!close&&['script','style','noscript','svg','iframe','template'].includes(name)){const finish=lower.indexOf(`</${name}`,cursor);const content=source.slice(cursor,finish<0?source.length:finish);if(name==='script')tokens.push({name,attrs:attributes(raw.slice(0,8000)),content});const finishEnd=finish<0?-1:source.indexOf('>',finish);cursor=finishEnd<0?source.length:finishEnd+1;continue;}
  tokens.push({name,close,attrs:attributes(raw.slice(0,8000))});
 }return tokens;
}
function tokenText(tokens,dropChrome=false) {
 const parts=[];let suppressed=0;
 for(const token of tokens){if(dropChrome&&['nav','header','footer','form'].includes(token.name)){suppressed=Math.max(0,suppressed+(token.close?-1:1));continue;}if(suppressed||token.name==='script')continue;if(token.text!==undefined)parts.push(decode(token.text));else if(token.name==='br'||token.close&&['p','div','li','h1','h2','h3','h4','section','ul','ol','tr'].includes(token.name))parts.push('\n');else parts.push(' ');}
 return parts.join('').replace(/[ \t\r]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
function region(tokens,name) {const start=tokens.findIndex(t=>t.name===name&&!t.close);if(start<0)return null;let depth=1;for(let i=start+1;i<tokens.length;i++)if(tokens[i].name===name){depth+=tokens[i].close?-1:1;if(depth===0)return tokens.slice(start+1,i);}return tokens.slice(start+1);}
export function plainText(html) {return tokenText(htmlTokens(html));}
function attributes(tag) {const values={};for(const match of tag.matchAll(/([a-z][\w:-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi))values[match[1].toLowerCase()]=decode(match[2]??match[3]??match[4]);return values;}
function jobPosting(data) {
 const queue=[data];let visited=0;const results=[];
 while(queue.length&&visited++<1000){const item=queue.shift();if(Array.isArray(item)){queue.push(...item.slice(0,1000));continue;}if(!item||typeof item!=='object')continue;const types=Array.isArray(item['@type'])?item['@type']:[item['@type']];if(types.some(t=>typeof t==='string'&&/(?:^|[/#])JobPosting$/.test(t)))results.push(item);if(item['@graph'])queue.push(item['@graph']);for(const [key,value] of Object.entries(item))if(key!=='@graph'&&value&&typeof value==='object')queue.push(value);}
 return results.sort((a,b)=>String(b.description??'').length-String(a.description??'').length)[0];
}
function locations(value) {return (Array.isArray(value)?value:[value]).filter(Boolean).map(place=>{const a=place.address??place;return [a.addressLocality,a.addressRegion,typeof a.addressCountry==='string'?a.addressCountry:a.addressCountry?.name].filter(v=>typeof v==='string').join(', ');}).filter(Boolean).join(' · ');}
export function requirementSummary(description,explicit='') {
 const source=plainText(explicit);
 const paragraphs=description.split(/\n/).map(line=>line.trim()).filter(Boolean);
 const heading=/^(?:(?:ihr|ihre|dein|deine|euer|your|candidate)\s+(?:profil|profile|qualifications)|(?:our|the)\s+requirements|requirements|qualifications|what you(?:'|’)ll bring|what we(?:'|’)re looking for|anforderungen|voraussetzungen|qualifikationen|das bringen sie mit|das bringst du mit|was sie mitbringen|was du mitbringst)(?:\s*[:：]\s*(.*))?\s*$/i;
 const end=/^(?:wir bieten(?: ihnen)?|was wir bieten|unser angebot|das bieten wir(?: ihnen)?|benefits|what we offer|our offer|we offer|apply(?: now)?|how to apply|application|bewerbung|jetzt bewerben|kontakt|contact|about us|über uns|(?:ihre|deine|your)\s+(?:aufgaben|tasks|responsibilities)|responsibilities|aufgaben)(?:\s*[:：].*)?\s*$/i;
 const section=[];let collecting=false;
 for(const paragraph of paragraphs){const start=paragraph.match(heading);if(start){collecting=true;if(start[1])section.push(start[1]);continue;}if(collecting&&end.test(paragraph)){collecting=false;continue;}if(collecting)section.push(paragraph);}
 if(section.length)return [...new Set([source,...section].filter(Boolean))].join('\n').slice(0,6000);
 if(source)return source.slice(0,6000);
 const lines=description.split(/\n|(?<=[.!?])\s+/).map(line=>line.trim()).filter(Boolean);
 const relevant=lines.filter(line=>/require|qualif|experience|skills?|must|degree|proficien|kenntnisse|anforder|profil|erfahrung|abschluss|voraussetzung|beherrsch|ausbildung/i.test(line));
 return [...new Set(relevant)].slice(0,12).join('\n').slice(0,6000);
}
function labelledField(description,labels) {return description.match(new RegExp(`^(?:${labels})\\s*:\\s*([^\\n]+)$`,'im'))?.[1]?.trim().slice(0,200)??'';}
export function parseVacancy(content,format='html') {
 if(typeof content!=='string'||content.length>MAX_PAGE_BYTES)throw new Error('Description exceeds the extraction limit.');
 let posting;let warning='';const tokens=format==='html'?htmlTokens(content):[];
 if(format==='json'){try{posting=jobPosting(JSON.parse(content));}catch{throw new Error(EXTRACTION_FALLBACK);}}
 else for(const script of tokens.filter(token=>token.name==='script')){if(script.attrs.type?.toLowerCase()!=='application/ld+json')continue;try{const candidate=jobPosting(JSON.parse(script.content));if(candidate&&(!posting||String(candidate.description??'').length>String(posting.description??'').length))posting=candidate;}catch{/* Broken JSON-LD does not prevent honest HTML fallback. */}}
 if(posting){const description=plainText(posting.description??'').slice(0,30000);const company=(typeof posting.hiringOrganization==='string'?posting.hiringOrganization:posting.hiringOrganization?.name)||labelledField(description,'Company|Employer|Unternehmen|Arbeitgeber');return {role:plainText(posting.title??'').slice(0,200),company:plainText(company??'').slice(0,200),location:locations(posting.jobLocation).slice(0,200)||labelledField(description,'Location|Ort|Standort')|| (posting.jobLocationType==='TELECOMMUTE'?'Remote':''),description,requirements:requirementSummary(description,[posting.qualifications,posting.skills,posting.experienceRequirements,posting.educationRequirements].filter(v=>typeof v==='string').join('\n')),method:'Structured JobPosting data',warning:[description.length<100?'Description is incomplete; paste the full vacancy.':'',description.length===30000?'Description limited to 30,000 characters; verify the full posting.':'',!posting.title||!company?'Some identity fields are missing; enter only verified details.':''].filter(Boolean).join(' ')};}
 const meta={};for(const tag of tokens.filter(token=>token.name==='meta')){const attr=tag.attrs;if(attr.name||attr.property)meta[attr.name??attr.property]=attr.content??'';}
 const body=region(tokens,'article')??region(tokens,'main')??region(tokens,'body')??[];
 const description=tokenText(body,true).slice(0,30000);
 if(/captcha|verify you are human|sign in to (?:view|continue)|log in to (?:view|continue)|access denied|enable javascript to continue/i.test(description)&&!/(?:responsibilities|qualifications|job description|anforderungen|aufgaben)/i.test(description))throw new Error(EXTRACTION_FALLBACK);
 if(!/(?:job description|responsibilities|qualifications|requirements|what you(?:'|’)ll|your (?:role|profile|tasks)|anforderungen|aufgaben|dein profil|ihr profil|qualifikation|stellenbeschreibung)/i.test(description))throw new Error(EXTRACTION_FALLBACK);
 const heading=tokenText(region(body,'h1')??[]);
 const role=heading||plainText(meta['job:title']??'');
 const company=plainText(meta['job:company']??meta['hiringOrganization']??'')||labelledField(description,'Company|Employer|Unternehmen|Arbeitgeber');
 const location=plainText(meta['job:location']??'')||labelledField(description,'Location|Ort|Standort');
 warning='Unstructured page text. Verify role, company, location and description; missing fields are left blank.'+(description.length===30000?' Description limited to 30,000 characters.':'');
 return {role:role.slice(0,200),company:company.slice(0,200),location:location.slice(0,200),description,requirements:requirementSummary(description),method:'HTML page text',warning};
}
export function parsePastedVacancy(value) {
 if(typeof value!=='string'||value.length>30000)throw new Error('Paste a description of at most 30,000 characters.');
 const html=/<(?:html|body|main|article|p|div|h[1-6]|ul|ol|li|br|section|script|style)\b[^>]*>/i.test(value);
 // Ordinary clipboard text remains exact, including comparison signs in questions.
 const description=html?plainText(value):value;
 const field=(labels)=>labelledField(description,labels);
 const lines=description.split(/\r?\n/).map(line=>line.trim()).filter(Boolean);
 const legal=/\b(?:GmbH(?:\s*&\s*Co\.?\s*KG)?|AG|Ltd\.?|Limited|LLC|Inc\.?|PLC|KG|SE|UG(?:\s*\(haftungsbeschränkt\))?|Corporation)\s*$/i;
 const board=/^(?:indeed|linkedin|stepstone|glassdoor|monster|arbeitsagentur|job board|job portal)(?:\s.*)?$/i;
 const metadata=/^(?:stellenbeschreibung|vollständige stellenbeschreibung|job description|full job description|job details|teilzeit(?: möglich)?|vollzeit|full[- ]time|part[- ]time|permanent|contract|remote|hybrid|on[- ]site)(?:\s*[,|/].*)?$/i;
 const narrative=/^(?:we|our|you|your|the|this|an?|join|apply|wir|unser|unsere|du|dein|deine|sie|ihr|ihre|bewerbung)\s/i;
 const short=line=>line.length<=160&&!/[.!?]$/.test(line)&&!line.includes('@')&&!board.test(line)&&!metadata.test(line)&&!narrative.test(line)&&!/[€$£]|https?:|\b\d{5}\b/.test(line);
 const roleWords=/\b(?:manager|management|engineer|analyst|coordinator|administrator|assistant|specialist|consultant|developer|designer|technician|nurse|accountant|director|officer|lead|associate|project|projektleiter|projektmanager|projektassistenz|immobilienverwalter|sachbearbeiter|entwickler|ingenieur|koordinator|assistenz|verwalter|pfleger|buchhalter|berater)\b/i;
 const roleIndex=lines.slice(0,8).findIndex(line=>short(line)&&roleWords.test(line));
 const headerRole=roleIndex>=0?lines[roleIndex]:'';
 const following=roleIndex>=0?lines.slice(roleIndex+1,Math.min(roleIndex+5,8)):[];
 let headerCompany=following.find(line=>line.length<=160&&!board.test(line)&&!narrative.test(line)&&legal.test(line))??'';
 if(!headerCompany&&roleIndex>=0){const candidate=lines[roleIndex+1]??'',next=lines[roleIndex+2]??'';const stableContext=metadata.test(next)||/[€$£]|\b\d{5}\b/.test(next);if(short(candidate)&&candidate.length<=100&&!roleWords.test(candidate)&&stableContext&&/^[\p{L}\p{N}&.,'’() -]+$/u.test(candidate))headerCompany=candidate;}
 const role=field('Role|Job title|Position|Stellentitel|Stelle')||headerRole;
 const company=field('Company|Employer|Unternehmen|Arbeitgeber')||headerCompany;
 let location=field('Location|Ort|Standort');
 if(!location){for(const line of lines.slice(0,20)){if(line.length>180||narrative.test(line)||/[€$£]/.test(line))continue;const address=line.match(/\b\d{5}\s*([A-ZÄÖÜ][\p{L}.'’()-]*(?:[ -][\p{L}.'’()-]+){0,5})/u);if(address){location=address[1].trim();break;}}}
 const otherCompanies=[...new Set(lines.map(line=>line.replace(/^(?:Company|Employer|Unternehmen|Arbeitgeber)\s*:\s*/i,'')).filter(line=>line.length<=160&&!board.test(line)&&!narrative.test(line)&&legal.test(line)&&line.toLowerCase()!==company.toLowerCase()))];
 const warning=['Header and labelled fields are candidates from the pasted source; verify them before saving.',!role||!company||!location?'Some identity fields could not be established and remain blank.':'',company&&otherCompanies.length?`The header employer differs from another legal organization in the source (${otherCompanies.slice(0,3).join('; ')}). Header employer retained; verify the employing entity.`:''].filter(Boolean).join(' ');
 return {role:role.slice(0,200),company:company.slice(0,200),location:location.slice(0,200),description,requirements:requirementSummary(description),method:'Pasted description',warning};
}
export function jobBrief(job) {return `JOB REFERENCE — reference only; do not tailor until I explicitly request.\n\nRole: ${job.role||'Not specified'}\nCompany: ${job.company||'Not specified'}\nLocation: ${job.location||'Not specified'}\nSource: ${job.url||'Pasted description — no URL provided'}\nStatus: ${job.status}\n\nKEY REQUIREMENTS (extracted text; not an AI fit assessment)\n${job.requirements||requirementSummary(job.jd)||'No explicit requirements extracted; review the description.'}\n\nJOB DESCRIPTION\n${job.jd||'No description recorded.'}\n\nKeep this as a reference. Do not rewrite my CV, submit an application or contact the employer unless I explicitly ask.`;}




