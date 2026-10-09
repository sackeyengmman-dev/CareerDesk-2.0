export const THEME_KEY='career-desk-theme';
export function resolveTheme(saved,systemDark){return saved==='light'||saved==='dark'?saved:systemDark?'dark':'light';}
export const themeInitScript=`(function(){var saved=null;try{saved=localStorage.getItem('career-desk-theme')}catch(e){}var dark=false;try{dark=matchMedia('(prefers-color-scheme: dark)').matches}catch(e){}var theme=saved==='light'||saved==='dark'?saved:dark?'dark':'light';document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme})()`;
