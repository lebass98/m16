import { describe, it, expect } from 'vitest';
import { csvToSections } from './parseSheetCsv';

describe('csvToSections', () => {
  it('빈 CSV → 빈 배열', () => {
    expect(csvToSections('')).toEqual([]);
    expect(csvToSections('section,pageTitle,id')).toEqual([]);
  });

  it('section 컬럼 없으면 throw', () => {
    expect(() => csvToSections('pageTitle,id\nfoo,1')).toThrow();
  });

  it('동일 섹션은 등장 순서대로 그룹화', () => {
    const csv = [
      'section,pageTitle,id,depth1,depth2,depth3,path,progressPc,progressMobile,start,updatedAt,end,note',
      'A,Page1,FE_1,d1,,,/p1,20,20,2026.01.01,,,',
      'B,Page2,FE_2,d2,,,/p2,0,0,2026.01.02,,,',
      'A,Page3,FE_3,d1,,,/p3,100,80,2026.01.03,,,',
    ].join('\n');
    const result = csvToSections(csv);
    expect(result).toHaveLength(2);
    expect(result[0].depth1).toBe('A');
    expect(result[0].data).toHaveLength(2);
    expect(result[1].depth1).toBe('B');
    expect(result[1].data).toHaveLength(1);
  });

  it('progressPc 정상 파싱', () => {
    const csv = [
      'section,pageTitle,id,progressPc,progressMobile,start,updatedAt,end,note',
      'A,P,1,80,60,,,,',
    ].join('\n');
    const result = csvToSections(csv);
    expect(result[0].data[0].progressPc).toBe(80);
    expect(result[0].data[0].progressMobile).toBe(60);
  });

  it('빈 section 행은 무시', () => {
    const csv = [
      'section,pageTitle,id',
      ',Skipped,X',
      'A,Keep,Y',
    ].join('\n');
    const result = csvToSections(csv);
    expect(result).toHaveLength(1);
    expect(result[0].data[0].id).toBe('Y');
  });

  it('따옴표 안 쉼표 처리', () => {
    const csv = [
      'section,pageTitle,id,note',
      'A,"Title, with comma",1,"note, also"',
    ].join('\n');
    const result = csvToSections(csv);
    expect(result[0].data[0].pageTitle).toBe('Title, with comma');
    expect(result[0].data[0].note).toBe('note, also');
  });
});
