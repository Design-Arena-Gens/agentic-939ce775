import dynamic from "next/dynamic";

const MainApp = dynamic(() => import("@/components/main-app"), { ssr: false });

export default function Page() {
  return <MainApp />;
}
