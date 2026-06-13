import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, MobileStepper, useTheme } from '@mui/material';

interface OnboardingStep {
  targetId: string;
  title: string;
  content: string;
  placement: 'bottom' | 'top' | 'left' | 'right' | 'center';
}

const STEPS: OnboardingStep[] = [
  {
    targetId: 'onboarding-site-selector',
    title: '1. 워크스페이스 전환',
    content: '현재 표시 중인 프로젝트를 클릭하여 다른 프로젝트로 전환할 수 있습니다. 여러 기기의 진척도와 가이드를 모아볼 수 있는 다른 워크스페이스를 선택해 보세요.',
    placement: 'bottom',
  },
  {
    targetId: 'onboarding-sidebar-nav',
    title: '2. 카테고리 & 섹션 필터',
    content: "사이드바의 '섹션' 목록을 클릭하여 관심 있는 특정 카테고리만 보이도록 페이지 목록을 필터링할 수 있습니다.",
    placement: 'right',
  },
  {
    targetId: 'onboarding-filter-bar',
    title: '3. 진행율 범위 & 상세 검색',
    content: '진행율 범위 슬라이더로 작업 수준별로 검색하거나 우측 상단 돋보기 버튼을 클릭해 특정 페이지를 빠르게 찾을 수 있습니다.',
    placement: 'bottom',
  },
  {
    targetId: 'onboarding-recipe-card',
    title: '4. 카드 정보 및 액션 버튼',
    content: '각 카드는 기기별 진행도와 최근 업데이트일을 보여줍니다. 북마크 등록, 바로가기 링크 열기, 대화형 전체화면 미리보기 돋보기 버튼을 제공합니다.',
    placement: 'bottom',
  },
  {
    targetId: 'onboarding-right-panel',
    title: '5. 종합 진행도 및 활동 내역',
    content: '워크스페이스의 PC/모바일 종합 달성률 통계와 최근 방문한 페이지 목록 및 북마크 요약을 제공하여 전체 현황을 빠르게 진단합니다.',
    placement: 'left',
  },
  {
    targetId: 'onboarding-settings-button',
    title: '6. 설정 메뉴',
    content: '설정 아이콘을 눌러 화면 모드, 콘텐츠 필터, 테마 색상(프리셋), 폰트 등 앱의 디자인과 기능을 입맛에 맞게 변경할 수 있습니다.',
    placement: 'bottom',
  },
  {
    targetId: 'onboarding-settings-drawer',
    title: '7. 설정 패널 & 화면 개인화',
    content: '설정 패널에서는 다크 모드, 우측 사이드바 숨김, 6가지 테마 컬러(프리셋) 선택, 폰트 종류 및 본문 글자 크기 조정 등 다양한 화면 개인화 옵션을 실시간으로 구성할 수 있습니다.',
    placement: 'left',
  },
];

interface OnboardingTourProps {
  active: boolean;
  onClose: () => void;
  onStepChange?: (step: number) => void;
}

export default function OnboardingTour({ active, onClose, onStepChange }: OnboardingTourProps) {
  const theme = useTheme();
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const scrollDebounceRef = useRef<number | null>(null);

  const updateSpotlight = () => {
    const currentStep = STEPS[step];
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      const elRect = el.getBoundingClientRect();
      // Only set rect if element is visible and has width/height
      if (elRect.width > 0 && elRect.height > 0) {
        setRect(elRect);
        return;
      }
    }
    setRect(null);
  };

  // Handle step change & scroll
  useEffect(() => {
    if (!active) return;

    const currentStep = STEPS[step];
    const el = document.getElementById(currentStep.targetId);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }

    // Set a short delay for scrolling to complete before capturing dimensions
    const timer = window.setTimeout(() => {
      updateSpotlight();
    }, 400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [step, active]);

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
  }, [active, step]);

  // Invoke step change callback
  useEffect(() => {
    if (active && onStepChange) {
      onStepChange(step);
    }
  }, [step, active, onStepChange]);

  if (!active) return null;

  const currentStep = STEPS[step];

  // Determine card styles dynamically
  const getCardStyle = (): React.CSSProperties => {
    const cardWidth = 340;
    const cardHeight = 220; // approximate height for positioning logic
    const gap = 16;

    if (!rect) {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: `${cardWidth}px`,
        zIndex: 10001,
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
      };
    }

    let top = 0;
    let left = 0;
    const placement = currentStep.placement;

    if (placement === 'bottom') {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - cardWidth / 2;
    } else if (placement === 'top') {
      top = rect.top - cardHeight - gap;
      left = rect.left + rect.width / 2 - cardWidth / 2;
    } else if (placement === 'left') {
      top = rect.top + rect.height / 2 - cardHeight / 2;
      left = rect.left - cardWidth - gap;
    } else if (placement === 'right') {
      top = rect.top + rect.height / 2 - cardHeight / 2;
      left = rect.right + gap;
    } else {
      top = window.innerHeight / 2 - cardHeight / 2;
      left = window.innerWidth / 2 - cardWidth / 2;
    }

    // Viewport overflow check and safe boundary keeping
    const margin = 16;
    left = Math.max(margin, Math.min(window.innerWidth - cardWidth - margin, left));
    top = Math.max(margin, Math.min(window.innerHeight - cardHeight - margin, top));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      width: `${cardWidth}px`,
      zIndex: 10001,
      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
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
        transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
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
      transition: 'all 0.3s cubic-bezier(0.22, 1, 0.36, 1)',
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
        onClick={onClose}
        sx={{
          position: 'absolute',
          inset: 0,
          cursor: 'pointer',
          pointerEvents: 'auto',
        }}
      />

      {/* Spotlight highlight window */}
      <Box style={getSpotlightStyle()} />

      {/* Popover content card */}
      <Paper
        elevation={16}
        style={getCardStyle()}
        sx={{
          p: '20px',
          borderRadius: '16px',
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
          pointerEvents: 'auto', // Allow buttons inside to be clicked
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
