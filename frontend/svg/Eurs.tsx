function Eurs() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="32"
      viewBox="0 0 256 256"
    >
      <defs>
        <linearGradient id="g2" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#4B6CB7" />
          <stop offset="1" stopColor="#182848" />
        </linearGradient>
      </defs>

      <circle cx="128" cy="128" r="108" fill="url(#g2)" />
      <circle
        cx="128"
        cy="128"
        r="92"
        fill="none"
        stroke="#ffffff18"
        strokeWidth="2"
      />

      <g fill="#fff" transform="translate(0,6)">
        <path d="M146 93c-6.5-4-16-6-26.1-6-10.2 0-19.6 2-26.1 6l6.1 10.4c5.7-3.4 13.8-5.9 22.6-5.9 8.7 0 16.8 2.4 22.5 5.9 4.9 2.9 8.4 7.8 8.4 13.1 0 9-7.1 16.6-16.5 18.2v10h-12v-9.3c-14.2-1.4-25.2-11.8-25.2-24.6 0-13.5 13.4-24.6 29.8-24.6 8.7 0 16.2 2.1 21.6 5.4l-6.1 10.6zM96 118h58v10H96zM96 138h58v10H96z" />
      </g>
    </svg>
  );
}

export default Eurs;
