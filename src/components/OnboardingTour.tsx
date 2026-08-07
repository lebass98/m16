import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Button, Paper, MobileStepper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface OnboardingStep {
  targetIds: string[];
  title: string;
  content: string;
  placement: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const STEPS: OnboardingStep[] = [
  {
    targetIds: ['onboarding-site-selector', 'onboarding-site-selector-mobile'],
    title: '1. 워크스페이스 전환',
    content: '현재 표시 중인 프로젝트를 클릭하여 다른 프로젝트로 전환할 수 있습니다. 여러 기기의 진척도와 가이드를 모아볼 수 있는 다른 워크스페이스를 선택해 보세요.',
    placement: 'right',
  },
  {
    targetIds: ['onboarding-sidebar-nav', 'onboarding-sidebar-nav-drawer', 'onboarding-sidebar-nav-mobile'],
    title: '2. 카테고리 & 섹션 필터',
    content: "사이드바 또는 모바일 메뉴의 '섹션' 목록을 클릭하여 관심 있는 특정 카테고리만 보이도록 페이지 목록을 필터링할 수 있습니다.",
    placement: 'right',
  },
  {
    targetIds: ['onboarding-filter-bar', 'onboarding-search-button-mobile'],
    title: '3. 진행율 범위 & 상세 검색',
    content: '진행율 범위 슬라이더로 작업 수준별로 검색하거나 우측 상단 돋보기 버튼을 클릭해 특정 페이지를 빠르게 찾을 수 있습니다.',
    placement: 'bottom',
  },
  {
    targetIds: ['onboarding-recipe-card', 'onboarding-recipe-card-mobile', 'onboarding-card-list'],
    title: '4. 카드 정보 및 액션 버튼',
    content: '각 카드는 기기별 진행도와 최근 업데이트일을 보여줍니다. 북마크 등록, 바로가기 링크 열기, 대화형 전체화면 미리보기 돋보기 버튼을 제공합니다.',
    placement: 'bottom',
  },
  {
    targetIds: ['onboarding-right-panel', 'onboarding-right-panel-stats', 'onboarding-dashboard-mobile', 'onboarding-site-selector-mobile'],
    title: '5. 종합 진행도 및 활동 내역',
    content: '워크스페이스의 PC/모바일 종합 달성률 통계와 최근 방문한 페이지 목록 및 북마크 요약을 제공하여 전체 현황을 빠르게 진단합니다.',
    placement: 'left',
  },
  {
    targetIds: ['onboarding-settings-button'],
    title: '6. 설정 메뉴',
    content: '설정 아이콘을 눌러 화면 모드, 콘텐츠 필터, 테마 색상(프리셋), 폰트 등 앱의 디자인과 기능을 입맛에 맞게 변경할 수 있습니다.',
    placement: 'bottom',
  },
  {
    targetIds: ['onboarding-settings-drawer-inner', 'onboarding-settings-drawer'],
    title: '7. 설정 패널 & 화면 개인화',
    content: '설정 패널에서는 다크 모드, 우측 사이드바 숨김, 6가지 테마 컬러(프리셋) 선택, 폰트 종류 및 본문 글자 크기 조정 등 다양한 화면 개인화 옵션을 실시간으로 구성할 수 있습니다.',
    placement: 'left',
  },
];

interface OnboardingTourProps {
  active: boolean;
  step: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
}

export default function OnboardingTour({ active, step, setStep, onClose }: OnboardingTourProps) {
  const theme = useTheme();
  const [rect, setRect] = useState<DOMRect | null>(null);
  const scrollDebounceRef = useRef<number | null>(null);

  // 현재 화면에서 실제 렌더링(width > 0 && height > 0)된 타겟 엘리먼트를 탐색 (우선순위 순)
  const findVisibleTarget = useCallback((targetIds: string[]): { element: HTMLElement; rect: DOMRect } | null => {
    for (const id of targetIds) {
      const elements = document.querySelectorAll(`[id="${id}"]`);
      for (let i = 0; i < elements.length; i++) {
        const el = elements[i] as HTMLElement;
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          return { element: el, rect: r };
        }
      }
    }
    return null;
  }, []);

  const updateSpotlight = useCallback(() => {
    const currentStep = STEPS[step];
    if (!currentStep) return;
    const target = findVisibleTarget(currentStep.targetIds);
    if (target) {
      setRect(target.rect);
    } else {
      setRect(null);
    }
  }, [step, findVisibleTarget]);

  // Step 변경 시 scrollIntoView & 650ms 동안 continuous animation tracking loop
  useEffect(() => {
    if (!active) return;

    const currentStep = STEPS[step];
    if (!currentStep) return;

    const target = findVisibleTarget(currentStep.targetIds);
    if (target?.element) {
      target.element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    let animationFrameId: number;
    const startTime = performance.now();

    const loop = () => {
      updateSpotlight();
      if (performance.now() - startTime < 650) {
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [step, active, updateSpotlight, findVisibleTarget]);

  // Handle resize and scroll updates
  useEffect(() => {
    if (!active) return;

    const handleUpdate = () => {
      if (scrollDebounceRef.current) {
        window.cancelAnimationFrame(scrollDebounceRef.current);
      }
      scrollDebounceRef.current = window.requestAnimationFrame(() => {
        updateSpotlight();
      });
    };

    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, true);

    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate, true);
      if (scrollDebounceRef.current) {
        window.cancelAnimationFrame(scrollDebounceRef.current);
      }
    };
  }, [active, updateSpotlight]);

  if (!active) return null;

  const currentStep = STEPS[step];

  // Dynamic Card style calculation with Zero Overlap placement & Hard Viewport Clamping Guard
  const getCardStyle = (): React.CSSProperties => {
    const isMobile = window.innerWidth < 600;
    const cardWidth = isMobile ? Math.min(320, window.innerWidth - 48) : 340;
    const cardHeight = 250; // 실제 카드 높이
    const gap = 20; // 타겟과 겹치지 않도록 이격거리 20px
    const minMarginLeft = 24;
    const minMarginTop = 80; // 화면 상단 잘림 방지 (최소 80px 여백 보장)
    const minMarginBottom = 24;

    if (!rect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
        zIndex: 10001,
      };
    }

    // ★★★ 5번 온보딩 스텝 (step === 4) - Auto-Flip 및 하단 계산 우회 전용 직통 분기 ★★★
    if (step === 4) {
      let step5Top = 0;
      let step5Left = 0;

      if (!isMobile && rect.width > 0) {
        // 우측 패널 시작점 바로 좌측 20px 옆 (rect.left - cardWidth - 20)
        // 상단 오프셋 (rect.top + 20 -> 약 Y: 110px)
        step5Left = rect.left - cardWidth - 20;
        step5Top = Math.max(90, rect.top + 20);

        // 오버랩 방지 제한 가드
        const maxStep5Left = rect.left - cardWidth - 16;
        step5Left = Math.min(maxStep5Left, step5Left);
      } else {
        step5Left = (window.innerWidth - cardWidth) / 2;
        step5Top = rect.bottom + gap;
      }

      // Viewport Clamping
      step5Left = Math.max(minMarginLeft, Math.min(window.innerWidth - cardWidth - 24, step5Left));
      step5Top = Math.max(minMarginTop, Math.min(window.innerHeight - cardHeight - minMarginBottom, step5Top));

      return {
        position: 'fixed',
        top: `${step5Top}px`,
        left: `${step5Left}px`,
        width: `${cardWidth}px`,
        zIndex: 10001,
      };
    }

    let top = 0;
    let left = 0;
    let preferredPlacement = currentStep.placement;

    // 1. 스텝별 선호 위치(left, top) 계산
    if (currentStep.targetIds.includes('onboarding-site-selector') || currentStep.targetIds.includes('onboarding-site-selector-mobile')) {
      if (!isMobile) {
        left = rect.right + gap;
        top = Math.max(minMarginTop, rect.top);
      } else {
        left = (window.innerWidth - cardWidth) / 2;
        top = rect.bottom + gap;
      }
    } else if (currentStep.targetIds.includes('onboarding-sidebar-nav')) {
      if (!isMobile) {
        left = rect.right + gap;
        top = Math.max(minMarginTop, rect.top);
      }
    } else if (currentStep.targetIds.includes('onboarding-settings-button')) {
      if (!isMobile) {
        left = rect.left - cardWidth - gap;
        top = Math.max(minMarginTop, rect.bottom + gap);
      }
    } else if (currentStep.targetIds.includes('onboarding-settings-drawer-inner') || currentStep.targetIds.includes('onboarding-settings-drawer')) {
      left = rect.left - cardWidth - gap;
      top = Math.max(minMarginTop, rect.top + 20);
    } else {
      // 모바일 환경이거나 공간이 좁을 경우 placement 자동 보정
      if (isMobile && (preferredPlacement === 'left' || preferredPlacement === 'right')) {
        preferredPlacement = 'bottom';
      }

      // Viewport overflow check & auto flip
      if (preferredPlacement === 'bottom') {
        if (rect.bottom + gap + cardHeight > window.innerHeight - minMarginBottom) {
          preferredPlacement = rect.top - gap - cardHeight > minMarginTop ? 'top' : 'center';
        }
      } else if (preferredPlacement === 'top') {
        if (rect.top - gap - cardHeight < minMarginTop) {
          preferredPlacement = rect.bottom + gap + cardHeight < window.innerHeight - minMarginBottom ? 'bottom' : 'center';
        }
      } else if (preferredPlacement === 'left') {
        if (rect.left - gap - cardWidth < minMarginLeft) {
          preferredPlacement = rect.bottom + gap + cardHeight < window.innerHeight - minMarginBottom ? 'bottom' : 'left';
        }
      } else if (preferredPlacement === 'right') {
        if (rect.right + gap + cardWidth > window.innerWidth - minMarginLeft) {
          preferredPlacement = rect.left - gap - cardWidth > minMarginLeft ? 'left' : 'bottom';
        }
      }

      if (preferredPlacement === 'bottom') {
        top = rect.bottom + gap;
        left = rect.left + rect.width / 2 - cardWidth / 2;
      } else if (preferredPlacement === 'top') {
        top = rect.top - cardHeight - gap;
        left = rect.left + rect.width / 2 - cardWidth / 2;
      } else if (preferredPlacement === 'left') {
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.left - cardWidth - gap;
      } else if (preferredPlacement === 'right') {
        top = rect.top + rect.height / 2 - cardHeight / 2;
        left = rect.right + gap;
      } else {
        top = window.innerHeight / 2 - cardHeight / 2;
        left = window.innerWidth / 2 - cardWidth / 2;
      }
    }

    // 2. ★★★ 100% 화면 내부 완벽 감금 가드 (Absolute Hard Clamping Guard) ★★★
    const maxLeft = Math.max(minMarginLeft, window.innerWidth - cardWidth - 24);
    const maxTop = Math.max(minMarginTop, window.innerHeight - cardHeight - minMarginBottom);

    left = Math.max(minMarginLeft, Math.min(maxLeft, left));
    top = Math.max(minMarginTop, Math.min(maxTop, top));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 10001,
    };
  };

  // Determine spotlight shading styles
  const getSpotlightStyle = (): React.CSSProperties => {
    if (!rect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        width: 0,
        height: 0,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
        zIndex: 10000,
        pointerEvents: 'none',
      };
    }

    const padding = 8;
    return {
      position: 'fixed',
      left: `${rect.left - padding}px`,
      top: `${rect.top - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
      borderRadius: '12px',
      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55)',
      zIndex: 10000,
      pointerEvents: 'none',
    };
  };

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'auto' }}>
      {/* Background shading click-to-skip wrapper */}
      <Box
        onClick={(e) => {
          if (rect) {
            const clickX = e.clientX;
            const clickY = e.clientY;
            const padding = 8;
            if (
              clickX >= rect.left - padding &&
              clickX <= rect.right + padding &&
              clickY >= rect.top - padding &&
              clickY <= rect.bottom + padding
            ) {
              const target = findVisibleTarget(currentStep.targetIds);
              if (target?.element) {
                target.element.click();
              }
              return;
            }
          }
          onClose();
        }}
        sx={{
          position: 'absolute',
          inset: 0,
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      />

      {/* Spotlight highlight window */}
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={getSpotlightStyle()}
      />

      {/* Popover content card */}
      <Paper
        component={motion.div}
        elevation={16}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 350, damping: 28 }}
        style={getCardStyle()}
        sx={{
          p: '20px',
          borderRadius: '16px',
          maxHeight: 'calc(100vh - 100px)',
          overflowY: 'auto',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(28, 28, 28, 0.88)' : 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid',
          borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)',
          boxShadow: theme.palette.mode === 'dark' ? '0 12px 40px rgba(0,0,0,0.6)' : '0 12px 40px rgba(31, 38, 135, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          boxSizing: 'border-box',
          pointerEvents: 'auto',
        }}
      >
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: 'text.primary', letterSpacing: '-0.01em' }}>
          {currentStep.title}
        </Typography>

        <Typography sx={{ fontSize: 13.5, color: 'text.secondary', lineHeight: 1.5, minHeight: 72 }}>
          {currentStep.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: '8px' }}>
          {/* Skip Button */}
          <Button
            size="small"
            color="inherit"
            onClick={onClose}
            sx={{
              fontSize: 12,
              color: 'text.disabled',
              minWidth: 'auto',
              p: '4px 8px',
              '&:hover': { color: 'text.primary', bgcolor: 'rgba(0, 0, 0, 0.04)' },
            }}
          >
            건너뛰기
          </Button>

          {/* Stepper controls */}
          <MobileStepper
            variant="dots"
            steps={STEPS.length}
            position="static"
            activeStep={step}
            sx={{
              bgcolor: 'transparent',
              p: 0,
              '& .MuiMobileStepper-dot': {
                width: 6,
                height: 6,
                bgcolor: 'rgb(var(--palette-grey-500Channel) / 0.24)',
              },
              '& .MuiMobileStepper-dotActive': {
                bgcolor: 'primary.main',
              },
            }}
            nextButton={null}
            backButton={null}
          />

          <Box sx={{ display: 'flex', gap: '6px' }}>
            {/* Back Button */}
            {step > 0 && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleBack}
                sx={{
                  fontSize: 12,
                  p: '4px 10px',
                  borderRadius: '8px',
                  borderColor: 'rgb(var(--palette-grey-500Channel) / 0.32)',
                  color: 'text.primary',
                  '&:hover': { borderColor: 'text.primary', bgcolor: 'rgba(0, 0, 0, 0.04)' },
                }}
              >
                이전
              </Button>
            )}

            {/* Next / Finish Button */}
            <Button
              variant="contained"
              size="small"
              onClick={handleNext}
              sx={{
                fontSize: 12,
                p: '4px 12px',
                borderRadius: '8px',
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 700,
                boxShadow: 'none',
                '&:hover': { bgcolor: 'primary.dark', boxShadow: 'none' },
              }}
            >
              {step === STEPS.length - 1 ? '완료' : '다음'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
