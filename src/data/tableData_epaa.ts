import type { TableSection } from '../types';

const base = 'https://pages.nisus.kr/wordncode/publishing/epaa/';
const p = (path: string) => base + path.replace('./', '');

export const tableDataEpaa: TableSection[] = [
  {
    depth1: '메인',
    data: [
      { pageTitle: '메인페이지', id: '', depth1: '메인페이지', depth2: '', depth3: '', path: p('./index.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '협의회소개',
    data: [
      { pageTitle: '인사말', id: '', depth1: '협의회소개', depth2: '인사말', depth3: '', path: p('./sub/intro/greeting.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '미션과 비전', id: '', depth1: '협의회소개', depth2: '미션과 비전', depth3: '', path: p('./sub/intro/vision.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '주요 연혁', id: '', depth1: '협의회소개', depth2: '주요 연혁', depth3: '', path: p('./sub/intro/history.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: 'CI', id: '', depth1: '협의회소개', depth2: 'CI', depth3: '', path: p('./sub/intro/CI.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '조직도', id: '', depth1: '협의회소개', depth2: '조직도', depth3: '', path: p('./sub/intro/orgChart.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '오시는 길', id: '', depth1: '협의회소개', depth2: '오시는 길', depth3: '', path: p('./sub/intro/location.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '주요사업',
    data: [
      { pageTitle: '주요사업', id: '', depth1: '주요사업', depth2: '', depth3: '', path: p('./sub/business/keyBusiness.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '협의회소식',
    data: [
      { pageTitle: '공지사항 목록', id: '', depth1: '협의회소식', depth2: '공지사항', depth3: '목록', path: p('./sub/news/notice-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '공지사항 상세', id: '', depth1: '협의회소식', depth2: '공지사항', depth3: '상세', path: p('./sub/news/notice-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '언론보도 목록', id: '', depth1: '협의회소식', depth2: '언론보도', depth3: '목록', path: p('./sub/news/release-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '언론보도 상세', id: '', depth1: '협의회소식', depth2: '언론보도', depth3: '상세', path: p('./sub/news/release-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '언론보도 쓰기', id: '', depth1: '협의회소식', depth2: '언론보도', depth3: '쓰기', path: p('./sub/news/release-write.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '입찰/공모 정보 목록', id: '', depth1: '협의회소식', depth2: '입찰/공모 정보', depth3: '목록', path: p('./sub/news/info-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '입찰/공모 정보 상세', id: '', depth1: '협의회소식', depth2: '입찰/공모 정보', depth3: '상세', path: p('./sub/news/info-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '입찰/공모 정보 쓰기', id: '', depth1: '협의회소식', depth2: '입찰/공모 정보', depth3: '쓰기', path: p('./sub/news/info-write.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '정기 뉴스레터 목록', id: '', depth1: '협의회소식', depth2: '정기 뉴스레터', depth3: '목록', path: p('./sub/news/letter-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '정기 뉴스레터 상세', id: '', depth1: '협의회소식', depth2: '정기 뉴스레터', depth3: '상세', path: p('./sub/news/letter-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '정기 뉴스레터 구독 탭', id: '', depth1: '협의회소식', depth2: '정기 뉴스레터', depth3: '구독 탭', path: p('./sub/news/letter-subscribe.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '협의회전용',
    data: [
      { pageTitle: '협의회 게시판 목록', id: '', depth1: '협의회전용', depth2: '협의회 게시판', depth3: '목록', path: p('./sub/exclusive/board-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '협의회 게시판 상세', id: '', depth1: '협의회전용', depth2: '협의회 게시판', depth3: '상세', path: p('./sub/exclusive/board-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '법령정보 및 정관규정 목록', id: '', depth1: '협의회전용', depth2: '법령정보 및 정관규정', depth3: '목록', path: p('./sub/exclusive/provision-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '법령정보 및 정관규정 상세', id: '', depth1: '협의회전용', depth2: '법령정보 및 정관규정', depth3: '상세', path: p('./sub/exclusive/provision-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '협의회 회의 목록', id: '', depth1: '협의회전용', depth2: '협의회 회의', depth3: '목록', path: p('./sub/exclusive/meeting-list.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '협의회 회의 상세', id: '', depth1: '협의회전용', depth2: '협의회 회의', depth3: '상세', path: p('./sub/exclusive/meeting-view.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '마이페이지',
    data: [
      { pageTitle: '회원정보관리', id: '', depth1: '마이페이지', depth2: '회원정보관리', depth3: '', path: p('./sub/mypage/member-update.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '비밀번호 확인', id: '', depth1: '마이페이지', depth2: '회원정보관리', depth3: '비밀번호 확인', path: p('./sub/mypage/password-check.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '비밀번호 변경', id: '', depth1: '마이페이지', depth2: '회원정보관리', depth3: '비밀번호 변경', path: p('./sub/mypage/password-change.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '소속기관 관리', id: '', depth1: '마이페이지', depth2: '회원정보관리', depth3: '소속기관 관리', path: p('./sub/mypage/organization.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '로그인',
    data: [
      { pageTitle: '로그인', id: '', depth1: '로그인', depth2: '', depth3: '', path: p('./sub/login/login.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '아이디찾기', id: '', depth1: '로그인', depth2: '아이디찾기', depth3: '', path: p('./sub/login/account.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
  {
    depth1: '회원가입',
    data: [
      { pageTitle: '약관동의', id: '', depth1: '회원가입', depth2: '약관동의', depth3: '', path: p('./sub/join/step1.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '정보입력', id: '', depth1: '회원가입', depth2: '정보입력', depth3: '', path: p('./sub/join/step2.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
      { pageTitle: '가입완료', id: '', depth1: '회원가입', depth2: '가입완료', depth3: '', path: p('./sub/join/step3.html'), progressPc: 100, progressMobile: 100, start: '', updatedAt: '', end: '', note: '' },
    ],
  },
];
