import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

/**
 * Dang ky plugin GSAP mot lan duy nhat cho ca ung dung.
 *
 * `registerPlugin` phai chay truoc moi lan dung ScrollTrigger hoac
 * SplitText. Goi nhieu lan khong gay loi nhung khong can thiet - co
 * `registered` de chan.
 */
let registered = false;

export function registerGsap(): void {
  if (registered) {
    return;
  }
  gsap.registerPlugin(ScrollTrigger, SplitText);
  registered = true;
}

export { gsap, ScrollTrigger, SplitText };
