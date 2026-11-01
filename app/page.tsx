import Hero from "@/components/home/Hero";
import Stats from "@/components/home/Stats";
import About from "@/components/home/About";
import Activities from "@/components/home/Activities";
import Campaigns from "@/components/home/Campaigns";
import Donate from "@/components/home/Donate";
import HelpRequest from "@/components/home/HelpRequest";
import Volunteer from "@/components/home/Volunteer";
import News from "@/components/home/News";
import Reveal from "@/components/Reveal";

export default function Home() {
  return (
    <>
      <Hero />
      <Stats />
      <Reveal>
        <About />
      </Reveal>
      <Reveal>
        <Activities />
      </Reveal>
      <Reveal>
        <Campaigns />
      </Reveal>
      <Reveal>
        <Donate />
      </Reveal>
      <Reveal>
        <HelpRequest />
      </Reveal>
      <Reveal>
        <Volunteer />
      </Reveal>
      <Reveal>
        <News />
      </Reveal>
    </>
  );
}