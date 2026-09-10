import { gsap } from 'gsap';

/**
 * Kiem chung GSAP animate duoc CSS custom property qua `quickTo`.
 *
 * Skill `gsap-core` noi `gsap.to` lam duoc, nhung `quickTo` la API khac -
 * can xac nhan thay vi suy doan, vi ca `appSpotlight` lan `appEdgeLight`
 * deu dua vao no.
 */
describe('GSAP voi CSS custom property', () => {
  let element: HTMLElement;

  beforeEach(() => {
    // Khong goi `registerGsap()`: ScrollTrigger.register can API trinh
    // duyet ma jsdom khong co. Phep thu nay chi can GSAP core.
    element = document.createElement('div');
    document.body.appendChild(element);
  });

  afterEach(() => {
    gsap.killTweensOf(element);
    element.remove();
  });

  it('gsap.set ghi duoc gia tri ban dau', () => {
    gsap.set(element, { '--spot-x': 42 });
    expect(element.style.getPropertyValue('--spot-x')).toBe('42');
  });

  it('quickTo cap nhat duoc custom property', async () => {
    gsap.set(element, { '--spot-x': 0 });

    const move = gsap.quickTo(element, '--spot-x', { duration: 0.1 });
    move(100);

    // Cho tween chay xong roi doc lai gia tri.
    await new Promise((resolve) => setTimeout(resolve, 200));

    const value = Number(element.style.getPropertyValue('--spot-x'));
    expect(value).toBeCloseTo(100, 0);
  });

  it('quickTo dung chung mot tween thay vi tao moi moi lan goi', () => {
    gsap.set(element, { '--edge-x': 50 });
    const move = gsap.quickTo(element, '--edge-x', { duration: 0.3 });

    move(10);
    move(20);
    move(30);

    // Ba lan goi lien tiep chi de lai mot tween - day chinh la ly do
    // dung `quickTo` cho su kien `pointermove`.
    expect(gsap.getTweensOf(element).length).toBe(1);
  });
});
