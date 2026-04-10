import Image from "next/image";

const globeAnimation = `
@keyframes globePulse {
  0%, 100% {
    box-shadow:
      inset 0 60px 80px -10px rgba(45,225,155,0.55),
      inset 0 30px 40px -5px rgba(45,225,155,0.3),
      0 -40px 100px 20px rgba(45,225,155,0.18),
      0 -15px 60px 10px rgba(45,225,155,0.1);
  }
  50% {
    box-shadow:
      inset 0 70px 100px -10px rgba(45,225,155,0.75),
      inset 0 35px 50px -5px rgba(45,225,155,0.45),
      0 -50px 120px 30px rgba(45,225,155,0.3),
      0 -20px 80px 15px rgba(45,225,155,0.18);
  }
}
`;

export default function Home() {
  return (
    <div className="relative flex flex-col flex-1 items-center justify-center bg-black font-sans overflow-hidden min-h-screen">
      <style dangerouslySetInnerHTML={{ __html: globeAnimation }} />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-repeat opacity-[0.06] bg-[url('/pixels.svg')] bg-[length:300px_300px]"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 z-1 bg-[radial-gradient(circle,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.4)_40%,transparent_70%)]"
      />
      <div className="relative z-10 w-full h-full flex flex-col space-y-2 items-center justify-center pb-20">
        <Image
          src="/text-logo.svg"
          alt="logo"
          width={500}
          height={500}
          className="w-48 sm:w-56 md:w-64 lg:w-[450px]"
        />
        <p className="font-bold tracking-[0.1em] text-sm sm:text-lg text-neutral-400 font-jetbrains">
          The on-chain pulse of Solana's network health.
        </p>
        <p className="font-medium uppercase tracking-[0.35em] text-[10px] text-neutral-400 mt-5 flex items-center gap-2">
          <span className="relative inline-flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          coming soon
        </p>
      </div>

      <div
        aria-hidden="true"
        className="absolute z-5 left-1/2 -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_50%_0%,rgba(45,225,155,0.18)_0%,rgba(20,80,60,0.25)_20%,rgba(5,30,25,0.5)_45%,rgba(0,8,12,0.85)_65%,#000_85%)] animate-[globePulse_4s_ease-in-out_infinite] w-[140vw] h-[140vw] bottom-[-119vw] sm:w-[110vw] sm:h-[110vw] sm:bottom-[-93.5vw] lg:w-[77vw] lg:h-[77vw] lg:bottom-[-65.5vw]"
      />
    </div>
  );
}
