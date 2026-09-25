interface LogoProps {
  size?: "sm" | "md" | "lg";
}

const Logo = ({ size = "md" }: LogoProps) => {
  const sizes = {
    sm: {
      container: "h-9 w-9",
      symbol: "text-xs",
      text: "text-lg",
    },

    md: {
      container: "h-11 w-11",
      symbol: "text-sm",
      text: "text-xl",
    },

    lg: {
      container: "h-16 w-16",
      symbol: "text-xl",
      text: "text-3xl",
    },
  };

  const current = sizes[size];

  return (
    <div className="flex items-center gap-3">

      {/* 3D Logo */}

      <div
        className={`
          ${current.container}
          relative
          flex
          items-center
          justify-center
          rounded-2xl
        `}
        style={{
          transform:
            "perspective(600px) rotateX(8deg) rotateY(-8deg)",
        }}
      >

        {/* Back 3D Layer */}

        <div
          className="
            absolute
            inset-0
            translate-x-1
            translate-y-2
            rounded-2xl
            bg-indigo-950
            opacity-80
          "
        />

        {/* Second Layer */}

        <div
          className="
            absolute
            inset-0
            translate-x-[3px]
            translate-y-[3px]
            rounded-2xl
            bg-purple-900
          "
        />

        {/* Main Face */}

        <div
          className="
            absolute
            inset-0
            rounded-2xl
            border
            border-white/30
            bg-gradient-to-br
            from-indigo-400
            via-purple-500
            to-cyan-400
            shadow-[0_15px_35px_rgba(99,102,241,0.45)]
          "
        >

          {/* Glass Shine */}

          <div
            className="
              absolute
              inset-0
              rounded-2xl
              bg-gradient-to-br
              from-white/35
              via-transparent
              to-transparent
            "
          />

          {/* Code Symbol */}

          <div
            className={`
              ${current.symbol}
              relative
              z-10
              flex
              h-full
              items-center
              justify-center
              font-black
              tracking-tight
              text-white
              drop-shadow-[0_4px_3px_rgba(0,0,0,0.5)]
            `}
          >
            {"</>"}
          </div>

        </div>

        {/* Bottom 3D Shadow */}

        <div
          className="
            absolute
            -bottom-2
            left-2
            right-2
            h-3
            rounded-full
            bg-indigo-950/70
            blur-md
          "
        />

      </div>

      {/* Text */}

      <div
        className={`
          ${current.text}
          font-black
          tracking-tight
        `}
      >

        <span className="text-white">
          Code
        </span>

        <span className="gradient-text">
          Sync
        </span>

      </div>

    </div>
  );
};

export default Logo;