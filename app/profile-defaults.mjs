// Only pass identity obtained from the trusted server sign-in helper.
export function profileDefaultsForUser(user,blank,owner={}) {
 const email=typeof user?.email==='string'?user.email.trim().toLowerCase():'';
 const ownerEmail=typeof owner.email==='string'?owner.email.trim().toLowerCase():'';
 return structuredClone(email&&ownerEmail&&email===ownerEmail&&owner.profile?owner.profile:blank);
}
