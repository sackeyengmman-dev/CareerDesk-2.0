import 'server-only';
import blank from './default-profile.json';
import {profileDefaultsForUser} from './profile-defaults.mjs';
export function defaultsForUser(user:{email:string}) {return profileDefaultsForUser(user,blank);}
