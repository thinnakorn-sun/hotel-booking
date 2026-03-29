export const EASE_SMOOTH = [0.22, 1, 0.36, 1] as const;

export const transitionPage = {
  duration: 0.26,
  ease: EASE_SMOOTH,
} as const;

export const transitionSpring = {
  type: 'spring' as const,
  stiffness: 520,
  damping: 28,
};

export const transitionSpringSoft = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
};
