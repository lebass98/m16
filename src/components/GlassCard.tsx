import { Box, type BoxProps } from '@mui/material';
import { glassCardSx } from '../theme/tokens';

/**
 * Minimals UI 글래스모피즘 카드.
 * sx 6속성 묶음을 매번 풀어쓰지 않도록 한 컴포넌트로 캡슐화.
 * 추가 스타일은 sx prop으로 머지된다.
 */
export default function GlassCard({ sx, ...rest }: BoxProps) {
  return <Box {...rest} sx={[glassCardSx, ...(Array.isArray(sx) ? sx : [sx])]} />;
}
