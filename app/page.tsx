import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import Activities from "@/components/home/Activities";
import Campaigns from "@/components/home/Campaigns";
import Donate from "@/components/home/Donate";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Activities />
      <Campaigns />
      <Donate />
    </>
  );
}