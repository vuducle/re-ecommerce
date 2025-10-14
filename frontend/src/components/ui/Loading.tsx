'use client';

import React from 'react';

type Props = {
  size?: number;
  text?: string;
};

export default function Loading({ size = 40, text }: Props) {
  const px = size;

  // unique ids to avoid collisions when multiple loaders are rendered
  const gradRed = 'loading_grad_red';
  const gradWhite = 'loading_grad_white';

  return (
    <div
      role="status"
      className="flex items-center justify-center py-6"
    >
      <div className="flex items-center gap-3">
        <div style={{ width: px, height: px }} aria-hidden>
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            strokeWidth="2"
            className="animate-spin"
          >
            <radialGradient
              id={gradRed}
              cx="150"
              cy="150"
              r="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#c00" offset=".3" />
              <stop stopColor="#a11" offset=".7" />
            </radialGradient>
            <radialGradient
              id={gradWhite}
              cx="150"
              cy="150"
              r="150"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#ddd" offset=".3" />
              <stop stopColor="#fff" offset=".6" />
              <stop stopColor="#ddd" offset=".9" />
            </radialGradient>
            <g id="a">
              <g id="b">
                <path
                  d="m206 5s-28 14-56 14-56-14-56-14l56 135z"
                  fill={`url(#${gradRed})`}
                  stroke="#870200"
                />
                <path
                  d="m87 8s-10 30-30 50c-19 19-49 29-49 29l135 56z"
                  fill={`url(#${gradWhite})`}
                  stroke="#bdbdbd"
                />
              </g>
              <use transform="rotate(90,150,150)" xlinkHref="#b" />
            </g>
            <use transform="rotate(180,150,150)" xlinkHref="#a" />
          </svg>
        </div>

        {text ? (
          <div className="text-sm text-gray-300">{text}</div>
        ) : null}
      </div>
    </div>
  );
}
