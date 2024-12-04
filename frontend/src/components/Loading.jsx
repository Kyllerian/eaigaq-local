// frontend/src/components/Loading.jsx
/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react';

const spinAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const styles = {
  container: css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 150px;
    height: 150px;
    aspect-ratio: 1;
    border-radius: 50%;
    outline: 1px solid #1976d2;
  `,
  svg: css`
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    animation: ${spinAnimation} 1.5s linear infinite;
  `,
  circle: css`
    cx: 50%;
    cy: 50%;
    r: calc(50% - 10px);
    stroke: #1976d2;
    stroke-width: 10;
    fill: none;
    stroke-dasharray: 100;
    stroke-dashoffset: 20;
  `,
};

export default function Loading() {
  return (
    <div css={styles.container}>
      <svg css={styles.svg}>
        <circle css={styles.circle} />
      </svg>
    </div>
  );
}
