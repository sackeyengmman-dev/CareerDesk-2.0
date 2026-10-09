import {context,failure,json} from '../shared';
import {fetchVacancy,parsePastedVacancy,boundedText} from '../../vacancy.mjs';
export async function POST(request:Request) {
 try {
  await context(request);
  if(Number(request.headers.get('content-length'))>100000)throw new Error('Extraction request is too large.');
  const text=await boundedText(request,100000);
  const payload=JSON.parse(text) as {url?:unknown;description?:unknown};
  const extracted=typeof payload.description==='string'?parsePastedVacancy(payload.description):await fetchVacancy(payload.url);
  return json({extracted});
 }catch(e){return failure(e);}
}
