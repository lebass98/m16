import { useEffect } from 'react';
import { Box } from '@mui/material';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function InteractiveBackground() {
  // 마우스의 정규화 좌표 (-0.5 ~ 0.5)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 쫀득한 스프링 물리 보간 설정 (stiffness: 반응 속도, damping: 반동 억제)
  const springConfig = { stiffness: 50, damping: 22, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      // 마우스 포인터의 위치를 화면 중앙(0, 0) 기준으로 -0.5 ~ 0.5 범위로 정규화
      const x = (event.clientX / window.innerWidth) - 0.5;
      const y = (event.clientY / window.innerHeight) - 0.5;
      
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  // 마우스의 방향과 상반된 방향 또는 서로 다른 속도로 구체들을 패럴랙스(Parallax) 이동
  // 픽셀 움직임 가중치를 크게 주어(180px ~ 320px) 눈에 잘 띄게 처리했습니다.
  const blob1X = useTransform(smoothX, (x) => x * 180);
  const blob1Y = useTransform(smoothY, (y) => y * 180);

  const blob2X = useTransform(smoothX, (x) => x * -240);
  const blob2Y = useTransform(smoothY, (y) => y * -240);

  const blob3X = useTransform(smoothX, (x) => x * 220);
  const blob3Y = useTransform(smoothY, (y) => y * 220);

  const blob4X = useTransform(smoothX, (x) => x * -320);
  const blob4Y = useTransform(smoothY, (y) => y * -320);

  return (
    <Box
      aria-hidden="true"
      sx={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        zIndex: -4, // 가장 뒷단에 배치
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {/* 구체 1: 좌측 상단 부근 - 바닐라 CSS 변수 --blob-color-1 연동 */}
      <Box
        component={motion.div}
        style={{
          x: blob1X,
          y: blob1Y,
        }}
        sx={{
          position: 'absolute',
          width: '1200px',
          height: '1200px',
          top: '-600px',
          left: '-600px',
          background: 'radial-gradient(circle, var(--blob-color-1) 0%, transparent 60%)',
          willChange: 'transform',
        }}
      />

      {/* 구체 2: 우측 상단 부근 - 바닐라 CSS 변수 --blob-color-2 연동 */}
      <Box
        component={motion.div}
        style={{
          x: blob2X,
          y: blob2Y,
        }}
        sx={{
          position: 'absolute',
          width: '1200px',
          height: '1200px',
          top: '-300px',
          right: '-400px',
          background: 'radial-gradient(circle, var(--blob-color-2) 0%, transparent 60%)',
          willChange: 'transform',
        }}
      />

      {/* 구체 3: 좌측 하단 부근 - 바닐라 CSS 변수 --blob-color-3 연동 */}
      <Box
        component={motion.div}
        style={{
          x: blob3X,
          y: blob3Y,
        }}
        sx={{
          position: 'absolute',
          width: '1200px',
          height: '1200px',
          bottom: '-500px',
          left: '-300px',
          background: 'radial-gradient(circle, var(--blob-color-3) 0%, transparent 60%)',
          willChange: 'transform',
        }}
      />

      {/* 구체 4: 우측 하단 부근 - 바닐라 CSS 변수 --blob-color-4 연동 */}
      <Box
        component={motion.div}
        style={{
          x: blob4X,
          y: blob4Y,
        }}
        sx={{
          position: 'absolute',
          width: '1200px',
          height: '1200px',
          bottom: '-600px',
          right: '-600px',
          background: 'radial-gradient(circle, var(--blob-color-4) 0%, transparent 60%)',
          willChange: 'transform',
        }}
      />
    </Box>
  );
}
