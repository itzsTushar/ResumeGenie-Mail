import Image from "next/image";

export default function Hero() {
  return (
   <section className="h-[calc(100vh-64px)] bg-[#f7f7f7] overflow-hidden">

  <div className="max-w-7xl mx-auto h-full relative">

    {/* Resume Image */}
    <div
      className="
        absolute
        right-0
        top-1/2
        -translate-y-1/2
        z-10
      "
    >
      <Image
        src="/resume.png"
        alt="Resume"
        width={430}
        height={560}
        className="
          rotate-12
          transition-all
          duration-500
          hover:rotate-6
          hover:scale-105
          drop-shadow-2xl
        "
      />
    </div>

    {/* Text */}
    <div
      className="
        relative
        z-20
        h-full
        flex
        flex-col
        justify-center
        pl-10
      "
    >
      <h1 className="text-7xl font-bold text-gray-900">
        ResumeGenie-Mail
      </h1>

      <p className="mt-8 text-2xl text-gray-600 max-w-3xl leading-10">
        AI-powered platform that automatically generates personalized
        job application emails from your resume and job descriptions,
        allowing you to apply faster with tailored content.
      </p>
    </div>

  </div>

</section>
  );
}
