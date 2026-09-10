import { PricePipe } from './price.pipe';

describe('PricePipe', () => {
  const pipe = new PricePipe();

  it('hien thi theo trieu khi duoi 1000', () => {
    expect(pipe.transform(594.4)).toBe('594 triệu');
  });

  it('hien thi theo ty khi tu 1000 tro len, dung dau phay thap phan', () => {
    expect(pipe.transform(1199.0)).toBe('1,20 tỷ');
  });

  it('lay 1000 lam nguong chuyen doi', () => {
    expect(pipe.transform(999.4)).toBe('999 triệu');
    expect(pipe.transform(1000)).toBe('1,00 tỷ');
  });

  it('tra ve dau gach ngang khi khong co gia', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
