import React from 'react'

export interface SourceIconProps {
  isActive: boolean
  size: number | string
}
export const ScryfallIcon = (
  { isActive, size}
:SourceIconProps) => (
  <svg
    focusable='false'
    aria-hidden='true'
    width={size}
    height={size}
    viewBox='0 0 460 460'
    xmlns='http://www.w3.org/2000/svg'
  >
    <g transform='translate(-60 -58)' fill='none' fillRule='evenodd'>
      <circle fill='#000' opacity='.09' cx='290' cy='288' r='230'></circle>
      <path
        fill='#BC979D'
        d='M279.508 112.547l-.028 361.84 43.137 6.808 56.715-13.23 28.54-72.547-28.044-178.926-31.887-113.004'
      ></path>
      <path
        fill='#AE7F9C'
        d='M281.57 100.633l-2.457 383.13-67.972-21.888 13.9-355.852'
      ></path>
      <path
        d='M207.05 113.316v344.032S87.364 394.5 93.388 283.043C99.41 171.586 207.05 113.316 207.05 113.316z'
        fill='#786076'
      ></path>
      <path
        d='M237.375 107.21l-30.603 4.35s-20.682 10.42-37.922 25.5c-75.19 167.948 108.332 115.1-12.725 286.69 50.647 47.86 72.293 41.137 72.293 41.137l8.957-357.676z'
        fill='#947A92'
      ></path>
      <path
        d='M343.058 89.985c-109.36-29.303-221.77 35.597-251.073 144.957-29.303 109.36 35.597 221.77 144.957 251.073 109.36 29.303 221.77-35.597 251.073-144.957 29.303-109.36-35.597-221.77-144.957-251.073zM256.342 451.95l.276.71c1.172 3.187 3.562 5.776 6.644 7.2 3.082 1.422 6.603 1.562 9.788.387l48.355-17.774c3.184-1.175 6.706-1.035 9.787.388 3.082 1.424 5.472 4.013 6.644 7.2l.19.56c2.105 5.852-.304 12.37-5.71 15.448-93.23 22.17-187.912-30.724-217.912-121.736s14.67-189.84 102.81-227.453c5.144.502 9.544 3.91 11.32 8.762 2.578 6.977 10.317 10.55 17.3 7.99l15.73-5.803c3.186-1.176 6.707-1.036 9.79.387 3.08 1.423 5.47 4.012 6.643 7.198l.19.56c1.174 3.185 1.034 6.706-.39 9.788-1.422 3.082-4.01 5.472-7.197 6.644l-109.46 40.366c-3.187 1.172-5.777 3.562-7.2 6.644-1.422 3.082-1.562 6.603-.388 9.788l.19.56c1.172 3.186 3.562 5.775 6.643 7.198 3.082 1.423 6.603 1.563 9.788.388l80.06-29.483c3.184-1.174 6.705-1.034 9.787.388 3.082 1.423 5.472 4.013 6.644 7.2l.19.56c1.173 3.184 1.034 6.705-.39 9.787-1.422 3.08-4.01 5.47-7.197 6.643l-127.814 47.08c-3.186 1.17-5.776 3.56-7.2 6.643-1.42 3.082-1.56 6.603-.387 9.788l.19.56c1.172 3.186 3.562 5.775 6.643 7.198 3.08 1.423 6.602 1.563 9.787.388L297.72 226.4c3.184-1.175 6.705-1.036 9.787.387 3.082 1.423 5.472 4.012 6.644 7.198l.467 1.27c1.174 3.186 1.035 6.707-.388 9.79-1.424 3.08-4.014 5.47-7.2 6.643l-113 41.54c-3.187 1.172-5.777 3.562-7.2 6.644-1.422 3.08-1.562 6.603-.387 9.787l.19.56c1.17 3.185 3.56 5.775 6.643 7.198 3.08 1.423 6.603 1.562 9.787.388l51.798-19.06c3.186-1.174 6.707-1.034 9.79.39 3.08 1.422 5.47 4.01 6.643 7.197l.19.56c1.174 3.185 1.034 6.706-.39 9.788-1.422 3.083-4.01 5.473-7.197 6.644l-89.085 32.754c-3.185 1.17-5.774 3.56-7.197 6.643-1.423 3.083-1.562 6.604-.388 9.79l.19.56c1.17 3.185 3.56 5.775 6.643 7.197 3.082 1.423 6.603 1.563 9.788.388L304.563 336.3c3.185-1.173 6.706-1.034 9.788.39 3.083 1.422 5.473 4.01 6.644 7.197l.19.56c1.174 3.185 1.035 6.706-.388 9.788s-4.013 5.472-7.198 6.644l-74.954 27.54c-3.186 1.17-5.776 3.56-7.2 6.643-1.422 3.082-1.56 6.603-.387 9.788l.19.56c1.172 3.187 3.562 5.777 6.643 7.2 3.082 1.422 6.603 1.562 9.788.387l94.147-34.537c3.185-1.175 6.706-1.035 9.788.388s5.472 4.012 6.644 7.198c2.428 6.58-.893 13.887-7.447 16.384l-86.903 33.168c-3.18 1.18-5.764 3.574-7.18 6.658-1.414 3.083-1.547 6.603-.367 9.784l-.018-.09z'
        fill={isActive ? 'var(--blue)' : '#FFF'}
      ></path>
    </g>
  </svg>
)
