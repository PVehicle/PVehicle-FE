import { FuelPipe } from './fuel.pipe';

describe('FuelPipe', () => {
  const pipe = new FuelPipe();

  it('hien thi "Xe điện" khi muc tieu hao bang 0', () => {
    expect(pipe.transform(0)).toBe('Xe điện');
  });

  it('hien thi muc tieu hao voi mot chu so thap phan', () => {
    expect(pipe.transform(10)).toBe('10,0 L/100km');
    expect(pipe.transform(7.3)).toBe('7,3 L/100km');
  });

  it('lam tron ve mot chu so thap phan', () => {
    // `toFixed` lam tron theo bieu dien IEEE-754: 9.46 -> 9.5, con 9.45
    // luu thuc te la 9.4499... nen lam tron xuong 9.4.
    expect(pipe.transform(9.46)).toBe('9,5 L/100km');
    expect(pipe.transform(9.44)).toBe('9,4 L/100km');
  });

  it('tra ve dau gach ngang khi khong co so lieu', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
