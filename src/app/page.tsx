import { LoginForm } from "@/components/ui/login";

export default function Home() {
  return (
    <>
      <div className='w-screen h-screen flex flex-col items-center justify-center bg-background transition-all duration-200'>
        <LoginForm />
      </div>
    </>
  );
}
