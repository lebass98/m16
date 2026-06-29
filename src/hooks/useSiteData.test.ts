import { describe, it, expect } from 'vitest';
import { formatFirestoreData, type FirestoreTableItem } from './useSiteData';

describe('formatFirestoreData', () => {
  it('should format flat Firestore items into TableSection structure correctly', () => {
    const mockItems: FirestoreTableItem[] = [
      {
        id: 'page-1',
        pageTitle: '로그인 화면',
        sectionDepth1: '공통',
        depth1: '공통',
        depth2: '인증',
        depth3: '로그인',
        path: '/common/login',
        progressPc: 100,
        progressMobile: 80,
        start: '2026.06.01',
        updatedAt: '2026.06.10',
        end: '2026.06.15',
        note: '로그인 완료',
        order: 0,
      },
      {
        id: 'page-2',
        pageTitle: '회원가입 화면',
        sectionDepth1: '공통',
        depth1: '공통',
        depth2: '인증',
        depth3: '회원가입',
        path: '/common/join',
        progressPc: 20,
        progressMobile: 0,
        start: '2026.06.02',
        updatedAt: '2026.06.03',
        end: '',
        note: '',
        order: 1,
      },
      {
        id: 'page-3',
        pageTitle: '마이페이지 메인',
        sectionDepth1: '마이페이지',
        depth1: '마이페이지',
        depth2: '메인',
        depth3: '',
        path: '/mypage/main',
        progressPc: 0,
        progressMobile: 0,
        start: '',
        updatedAt: '',
        end: '',
        note: '',
        order: 2,
      },
    ];

    const result = formatFirestoreData(mockItems);

    expect(result).toHaveLength(2);
    expect(result[0].depth1).toBe('공통');
    expect(result[0].data).toHaveLength(2);
    expect(result[0].data[0].id).toBe('page-1');
    expect(result[0].data[1].id).toBe('page-2');

    expect(result[1].depth1).toBe('마이페이지');
    expect(result[1].data).toHaveLength(1);
    expect(result[1].data[0].id).toBe('page-3');

    // Firestore 전용 필드(sectionDepth1, order)가 제거되었는지 확인
    expect((result[0].data[0] as any).sectionDepth1).toBeUndefined();
    expect((result[0].data[0] as any).order).toBeUndefined();
  });
});
