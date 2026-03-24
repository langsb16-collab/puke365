import { useEffect, useState } from 'react';

/**
 * 디바이스 방향 감지 훅
 * 세로(Portrait) vs 가로(Landscape) 자동 감지
 * 
 * @returns {boolean} isLandscape - true면 가로, false면 세로
 */
export function useOrientation() {
  const [isLandscape, setIsLandscape] = useState(
    window.innerWidth > window.innerHeight
  );

  useEffect(() => {
    const handleResize = () => {
      const newIsLandscape = window.innerWidth > window.innerHeight;
      setIsLandscape(newIsLandscape);
      
      // 디버깅용 로그 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log(`[Orientation] ${newIsLandscape ? 'Landscape' : 'Portrait'} (${window.innerWidth}x${window.innerHeight})`);
      }
    };

    // 화면 회전 감지
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    // 초기 체크
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isLandscape;
}

/**
 * 디바이스 타입 감지
 * @returns {'mobile' | 'tablet' | 'desktop'}
 */
export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>(() => {
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return deviceType;
}

/**
 * 카드 크기 자동 계산
 * 디바이스와 방향에 따라 최적 크기 반환
 */
export function useCardSize() {
  const isLandscape = useOrientation();
  const deviceType = useDeviceType();

  // 세로 모드 카드 크기
  if (!isLandscape) {
    if (deviceType === 'mobile') {
      return { width: 80, height: 116, name: 'mobile-portrait' };
    }
    return { width: 90, height: 130, name: 'tablet-portrait' };
  }

  // 가로 모드 카드 크기 (작게)
  if (deviceType === 'mobile') {
    return { width: 50, height: 72, name: 'mobile-landscape' };
  }
  return { width: 60, height: 86, name: 'tablet-landscape' };
}
