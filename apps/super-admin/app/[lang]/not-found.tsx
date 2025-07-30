import Image from 'next/image';
import '@/global.css';

export default async function NotFound() {
  return (
    <main className="min-h-full  isolate py-20 overflow-hidden">
      <Image
        src="/images/404/404background.jpeg"
        width={1920}
        height={1080}
        alt="Picture of the author"
        className="absolute inset-0 -z-10 size-full object-cover object-bottom brightness-75 saturate-50 contrast-125"
      />
      <div className="mx-auto max-w-7xl px-6 py-32 text-center sm:py-40 lg:px-8">
        <p className="text-base/8 font-semibold text-white">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-balance text-white sm:text-7xl">
          Page not found
        </h1>
        <p className="mt-6 text-lg font-medium text-pretty text-white/85 sm:text-xl/8">
          Sorry, we couldn’t find the page you’re looking for.
        </p>
        <div className="mt-10 flex justify-center">
          <a href="/" className="text-lg/7 font-semibold text-white">
            <span aria-hidden="true">&larr;</span> Back to home
          </a>
        </div>
      </div>
    </main>
  );
}
